import {
    profileTemplate,
    editProfileModalTemplate,
    storyItemTemplate,
} from '../templates.js';
import ProfilePresenter from './profile-presenter.js';
import * as AuthModel from '../../utils/auth.js';
import { setupStoryInteractions } from '../story/story-interactions.js';
import { setupStoryActions } from '../story/story-actions.js';
import { displayAndManageEditStoryModal } from '../story/editStoryModalManager.js';

export default class ProfilePage {
    #presenter = null;
    #currentUser = null;
    #storyDataChangedHandler = null;
    #editStoryModalRequestHandler = null;
    #profileUpdatedHandler = null;

    async render() {
        this.#currentUser = JSON.parse(localStorage.getItem('user')) || {};
        return profileTemplate(this.#currentUser);
    }

    async afterRender() {
        this.#presenter = new ProfilePresenter({
            view: this,
            authModel: AuthModel,
        });

        this.#setupStoryDataChangedListener();
        this.#setupProfileUpdatedListener();
        this.#setupEditStoryModalListener();

        await this.#presenter.loadUserProfile();
        this.#setupEventListeners();
    }

    #setupEditStoryModalListener() {
        this.#editStoryModalRequestHandler = (event) => {
            const { storyId, currentContent } = event.detail;
            if (
                this.#presenter &&
                typeof this.#presenter.isStoryOnProfile === 'function'
            ) {
                if (this.#presenter.isStoryOnProfile(storyId)) {
                    displayAndManageEditStoryModal(
                        storyId,
                        currentContent,
                        this.#presenter
                    );
                } else {
                    console.log(
                        `Edit request for story ${storyId} ignored: not on this profile.`
                    );
                }
            } else {
                console.warn(
                    'Presenter or isStoryOnProfile method not available. Cannot verify story context for edit.'
                );
            }
        };
        document.addEventListener(
            'showEditStoryModalRequest',
            this.#editStoryModalRequestHandler
        );
    }

    #setupStoryDataChangedListener() {
        this.#storyDataChangedHandler = async (event) => {
            const { storyId, action, newStory, updatedStory } = event.detail;

            const currentUserForCheck =
                JSON.parse(localStorage.getItem('user')) || {};
            let needsProfileReload = false;

            if (
                action === 'posted' &&
                newStory?.username === currentUserForCheck.username
            ) {
                needsProfileReload = true;
            } else if (['edited', 'deleted'].includes(action)) {
                if (
                    this.#presenter &&
                    typeof this.#presenter.isStoryOnProfile === 'function' &&
                    this.#presenter.isStoryOnProfile(storyId)
                ) {
                    needsProfileReload = true;
                }
            } else if (['liked', 'commented'].includes(action)) {
                if (
                    this.#presenter &&
                    typeof this.#presenter.isStoryOnProfile === 'function' &&
                    this.#presenter.isStoryOnProfile(storyId)
                ) {
                    needsProfileReload = true;
                }
            }

            if (needsProfileReload) {
                console.log(
                    'ProfilePage: Reloading user profile due to storyDataChanged',
                    { action, storyId }
                );
                await this.#presenter.loadUserProfile();
            }
        };
        document.addEventListener(
            'storyDataChanged',
            this.#storyDataChangedHandler
        );
    }

    #setupProfileUpdatedListener() {
        this.#profileUpdatedHandler = (event) => {
            const updatedUserData = event.detail;
            this.#currentUser = updatedUserData;
            console.log(
                'ProfilePage: profileUpdated event received, local currentUser updated.',
                updatedUserData
            );
        };
        document.addEventListener(
            'profileUpdated',
            this.#profileUpdatedHandler
        );
    }

    destroy() {
        if (this.#storyDataChangedHandler) {
            document.removeEventListener(
                'storyDataChanged',
                this.#storyDataChangedHandler
            );
            this.#storyDataChangedHandler = null;
        }
        if (this.#editStoryModalRequestHandler) {
            document.removeEventListener(
                'showEditStoryModalRequest',
                this.#editStoryModalRequestHandler
            );
            this.#editStoryModalRequestHandler = null;
        }
        if (this.#profileUpdatedHandler) {
            document.removeEventListener(
                'profileUpdated',
                this.#profileUpdatedHandler
            );
            this.#profileUpdatedHandler = null;
        }

        console.log('ProfilePage destroyed and listeners cleaned up.');
    }

    #setupEventListeners() {
        const menuTrigger = document.querySelector('.profileMenuBtn');
        const menuDropdown = document.querySelector('.story-menu');

        const editBtnDesktop = document.getElementById('editProfileBtn');
        const editBtnMobile = document.getElementById('editProfileMobile');

        const logoutBtnDesktop = document.getElementById('logoutBtnDesktop');
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');

        if (menuTrigger && menuDropdown) {
            menuTrigger.addEventListener('click', (event) => {
                event.stopPropagation();
                menuDropdown.classList.toggle('hidden');
            });

            window.addEventListener('click', () => {
                if (!menuDropdown.classList.contains('hidden')) {
                    menuDropdown.classList.add('hidden');
                }
            });
        }

        const handleEditClick = () => {
            const userDataForModal =
                JSON.parse(localStorage.getItem('user')) ||
                this.#currentUser ||
                {};
            this.#showEditProfileModal(userDataForModal);
        };

        const handleLogoutClick = () => {
            if (this.#presenter) {
                this.#presenter.handleLogout();
            }
        };

        if (editBtnDesktop) {
            editBtnDesktop.addEventListener('click', handleEditClick);
        }
        if (editBtnMobile) {
            editBtnMobile.addEventListener('click', handleEditClick);
        }

        if (logoutBtnDesktop) {
            logoutBtnDesktop.addEventListener('click', handleLogoutClick);
        }
        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', handleLogoutClick);
        }
    }

    #showEditProfileModal(userData) {
        const existingModal = document.getElementById('editProfileModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML(
            'beforeend',
            editProfileModalTemplate(userData)
        );

        const modal = document.getElementById('editProfileModal');
        const closeBtn = document.getElementById('closeEditProfileModalBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const form = document.getElementById('editProfileForm');
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        const profilePictureInput = document.getElementById(
            'profilePictureInput'
        );
        const profileImagePreview = document.getElementById(
            'profileImagePreview'
        );

        if (
            !modal ||
            !closeBtn ||
            !cancelBtn ||
            !form ||
            !changePhotoBtn ||
            !profilePictureInput ||
            !profileImagePreview
        ) {
            console.error('One or more edit profile modal elements not found.');
            if (modal) modal.remove();
            return;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const closeModalFunc = () => this.#closeModal(modal);

        closeBtn.addEventListener('click', closeModalFunc);
        cancelBtn.addEventListener('click', closeModalFunc);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalFunc();
            }
        });

        changePhotoBtn.addEventListener('click', () => {
            profilePictureInput.click();
        });

        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImagePreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Menyimpan...';

            const formData = new FormData(form);
            const updatedData = {
                name: formData.get('name'),
                username: formData.get('username'),
            };

            if (profilePictureInput.files[0]) {
                const file = profilePictureInput.files[0];
                if (file.size > 2 * 1024 * 1024) {
                    alert('Ukuran gambar terlalu besar. Maksimal 2MB');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    return;
                }
                try {
                    updatedData.profilePicture =
                        await this.#convertImageToBase64(file);
                } catch (imgError) {
                    console.error(
                        'Error converting image to Base64:',
                        imgError
                    );
                    alert('Gagal memproses gambar. Silakan coba lagi.');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    return;
                }
            }

            try {
                if (this.#presenter) {
                    const result =
                        await this.#presenter.updateProfile(updatedData);
                    if (result && !result.error) {
                        closeModalFunc();
                    } else if (result && result.message) {
                        alert(result.message);
                    } else {
                        alert(
                            'Gagal memperbarui profil. Respons tidak diketahui.'
                        );
                    }
                }
            } catch (error) {
                alert(error.message || 'Gagal memperbarui profil.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    #closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.add('hidden');
            modalElement.classList.remove('flex');
            setTimeout(() => modalElement.remove(), 300);
        }
    }

    async #convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    showUserStories(stories) {
        const storiesContainer = document.getElementById(
            'user-stories-container'
        );
        if (!storiesContainer) {
            console.error(
                "Element with ID 'user-stories-container' not found."
            );
            return;
        }

        this.#currentUser = JSON.parse(localStorage.getItem('user')) || {};

        if (!stories || stories.length === 0) {
            storiesContainer.innerHTML =
                '<p class="text-gray-500 text-center py-8">Belum ada unggahan</p>';
            return;
        }

        storiesContainer.innerHTML = stories
            .map((story) => {
                const storyId = story.id || story._id;
                const displayName = story.isAnonymous
                    ? 'Pengguna'
                    : story.name || this.#currentUser.name;
                const displayHandle = story.isAnonymous
                    ? 'Anonim'
                    : `@${story.username || this.#currentUser.username}`;
                const displayProfilePicture = story.isAnonymous
                    ? './images/image.png'
                    : story.profilePicture ||
                      this.#currentUser.profilePicture ||
                      './images/image.png';

                const isOwner =
                    !story.isAnonymous &&
                    story.username === this.#currentUser.username;

                return storyItemTemplate({
                    username: displayName,
                    handle: displayHandle,
                    content: story.content,
                    isAnonymous: story.isAnonymous,
                    storyId: storyId,
                    likeCount: story.likeCount || story.likes?.length || 0,
                    userLiked: story.userLiked || false,
                    commentCount: story.totalCommentCount,
                    viewCount: story.viewCount || story.views || 0,
                    profilePicture: displayProfilePicture,
                    createdAt: story.createdAt,
                    isOwner: isOwner,
                });
            })
            .join('');

        if (this.#presenter) {
            setupStoryInteractions(this.#presenter, 'user-stories-container');
            setupStoryActions(this.#presenter, 'user-stories-container');
        }
    }

    updateProfileHeaderDisplay(userData) {
        const profilePageContainer = document.querySelector(
            '.ml-16.min-h-screen.p-10'
        );
        if (!profilePageContainer) return;

        const profilePicElement =
            profilePageContainer.querySelector('.w-24.h-24 img');
        const nameElement = profilePageContainer.querySelector(
            '.text-lg.font-medium'
        );
        const usernameElement = profilePageContainer.querySelector(
            'div > .text-gray-500'
        );

        if (profilePicElement)
            profilePicElement.src =
                userData.profilePicture || '/images/image.png';
        if (nameElement)
            nameElement.textContent = userData.name || 'Nama Pengguna';
        if (usernameElement)
            usernameElement.textContent = `@${userData.username || 'namapengguna'}`;
    }

    logoutSuccess() {
        window.location.hash = '/';
    }
}
