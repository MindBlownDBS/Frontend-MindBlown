export const setupCommentActions = (presenter, containerElementId) => {
    const container = document.getElementById(containerElementId);
    if (!container) return;

    let activeCommentMenu = null;

    container.addEventListener('click', (e) => {
        const menuBtn = e.target.closest('.comment-menu-btn');
        if (menuBtn) {
            e.stopPropagation();
            const menu = menuBtn.nextElementSibling;

            document
                .querySelectorAll(`#${containerElementId} .comment-menu`)
                .forEach((m) => {
                    if (m !== menu && !m.classList.contains('hidden')) {
                        m.classList.add('hidden');
                    }
                });

            menu.classList.toggle('hidden');
            activeCommentMenu = menu.classList.contains('hidden') ? null : menu;
        }
    });

    container.addEventListener(
        'click',
        (e) => {
            if (
                activeCommentMenu &&
                !activeCommentMenu.classList.contains('hidden')
            ) {
                if (
                    !activeCommentMenu.contains(e.target) &&
                    !e.target.closest('.comment-menu-btn')
                ) {
                    activeCommentMenu.classList.add('hidden');
                    activeCommentMenu = null;
                }
            }
        },
        true
    );

    container.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-comment-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const menu = deleteBtn.closest('.comment-menu');
            if (menu) menu.classList.add('hidden');
            activeCommentMenu = null;

            const commentId = deleteBtn.dataset.commentId;
            if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
                try {
                    const response =
                        await presenter.deleteExistingComment(commentId);
                    if (response.error) {
                        alert(`Gagal menghapus komentar: ${response.message}`);
                    }
                } catch (error) {
                    alert(
                        'Gagal menghapus komentar: ' +
                            (error.message || 'Terjadi kesalahan')
                    );
                }
            }
        }
    });
};
