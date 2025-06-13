import { editStoryModalTemplate } from '../templates.js';

export function displayAndManageEditStoryModal(
    storyId,
    currentContent,
    presenter
) {
    const existingModal = document.getElementById('editStoryModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = editStoryModalTemplate({ content: currentContent });

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalElement = document.getElementById('editStoryModal');
    const closeButton = document.getElementById('closeEditStoryModalBtn');
    const cancelButton = document.getElementById('cancelEditStoryBtn');
    const editStoryForm = document.getElementById('editStoryForm');
    const storyContentInput = document.getElementById('storyContentInput');
    const submitButton = editStoryForm
        ? editStoryForm.querySelector('button[type="submit"]')
        : null;

    if (
        !modalElement ||
        !closeButton ||
        !cancelButton ||
        !editStoryForm ||
        !storyContentInput ||
        !submitButton
    ) {
        console.error(
            'Error: One or more elements for the edit story modal were not found in the DOM. Template IDs might be incorrect.'
        );
        if (modalElement) modalElement.remove();
        return;
    }

    modalElement.classList.remove('hidden');
    modalElement.classList.add('flex');

    const closeModal = () => {
        modalElement.classList.add('hidden');
        modalElement.classList.remove('flex');
        setTimeout(() => {
            modalElement.remove();
        }, 300);
    };

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            closeModal();
        }
    });

    editStoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newContent = storyContentInput.value.trim();

        if (!newContent) {
            alert('Konten cerita tidak boleh kosong.');
            return;
        }

        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Menyimpan...';

        try {
            await presenter.editStory(storyId, newContent);
            closeModal();
        } catch (error) {
            console.error('Failed to edit story:', error);
            alert(error.message || 'Gagal menyimpan perubahan cerita.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}
