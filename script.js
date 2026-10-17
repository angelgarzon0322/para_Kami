// ==========================================
// 1. CONFIGURA AQUÍ TU FECHA ESPECIAL
// (Año, Mes - 1, Día, Hora, Minutos)
// Nota: En JS los meses van de 0 a 11 (Ej: 0 = Enero, 1 = Febrero, ..., 11 = Diciembre)
// ==========================================
const startDate = new Date(2025, 7, 24, 0, 0, 0); // Ejemplo: 14 de Febrero de 2023

// Mostrar la fecha bonita en texto automáticamente
function displayStartDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = startDate.toLocaleDateString('es-ES', options);
    const startDateElement = document.getElementById('start-date-text');
    if (startDateElement) {
        startDateElement.innerText = `Desde el ${dateString} 💕`;
    }
}

function updateCounter() {
    const now = new Date();
    const difference = now - startDate;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;
}

// Ejecutar funciones al cargar
displayStartDate();
setInterval(updateCounter, 1000);
updateCounter();

// ==========================================
// DESPLEGAR Y OCULTAR LA CARTA PRINCIPAL
// ==========================================
const letterBtn = document.getElementById('toggle-letter-btn');
const letterContent = document.getElementById('letter-content');

if (letterBtn && letterContent) {
    letterBtn.addEventListener('click', () => {
        letterContent.classList.toggle('hidden');
        if (letterContent.classList.contains('hidden')) {
            letterBtn.innerText = '✨ Abrir mi carta para ti ✨';
        } else {
            letterBtn.innerText = '✉️ Ocultar carta';
        }
    });
}

// ==========================================
// GESTIÓN DE FOTOS (Fijas del Repositorio + Dinámicas)
// ==========================================
document.addEventListener('DOMContentLoaded', loadSavedPhotos);

function handleImage(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        const caption = prompt('Ingresa un texto para esta foto:', 'Nuevo momento especial 💕') || 'Momento especial 💕';
        const photoId = 'photo_' + Date.now();

        // Agregar al DOM e incluir la opción de edición/eliminación solo para las dinámicas
        addDynamicPhotoToGallery(photoId, imageDataUrl, caption);
        savePhotoToStorage(photoId, imageDataUrl, caption);

        input.value = '';
    };

    reader.onerror = function() {
        alert('Hubo un error al leer la imagen. Intenta con otra.');
        input.value = '';
    };

    reader.readAsDataURL(file);
}

function addDynamicPhotoToGallery(id, src, caption) {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;

    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card', 'dynamic-photo');
    photoCard.dataset.id = id;
    photoCard.innerHTML = `
        <img src="${src}" alt="${caption}">
        <p>${caption}</p>
    `;

    // Eventos de pulsación prolongada (Long-press) para editar o eliminar fotos NUEVAS
    let pressTimer;

    const startPress = () => {
        pressTimer = setTimeout(() => {
            showPhotoOptions(id);
        }, 600);
    };

    const cancelPress = () => {
        clearTimeout(pressTimer);
    };

    photoCard.addEventListener('touchstart', startPress);
    photoCard.addEventListener('touchend', cancelPress);
    photoCard.addEventListener('touchmove', cancelPress);

    photoCard.addEventListener('mousedown', startPress);
    photoCard.addEventListener('mouseup', cancelPress);
    photoCard.addEventListener('mouseleave', cancelPress);

    photoCard.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showPhotoOptions(id);
    });

    galleryContainer.appendChild(photoCard);
}

function showPhotoOptions(id) {
    const option = prompt('¿Qué deseas hacer con esta foto?\n\n1: Editar la frase\n2: Eliminar la foto', '1');

    if (option === '1') {
        editPhotoCaption(id);
    } else if (option === '2') {
        deletePhoto(id);
    }
}

function editPhotoCaption(id) {
    const card = document.querySelector(`.photo-card[data-id="${id}"]`);
    if (!card) return;

    const currentCaption = card.querySelector('p').innerText;
    const newCaption = prompt('Edita la frase:', currentCaption);

    if (newCaption !== null && newCaption.trim() !== '') {
        card.querySelector('p').innerText = newCaption;

        let savedPhotos = JSON.parse(localStorage.getItem('custom_photos') || '[]');
        savedPhotos = savedPhotos.map(photo => {
            if (photo.id === id) {
                photo.caption = newCaption;
            }
            return photo;
        });
        localStorage.setItem('custom_photos', JSON.stringify(savedPhotos));
    }
}

function deletePhoto(id) {
    if (confirm('¿Seguro que deseas eliminar esta foto?')) {
        const card = document.querySelector(`.photo-card[data-id="${id}"]`);
        if (card) {
            card.remove();
        }

        let savedPhotos = JSON.parse(localStorage.getItem('custom_photos') || '[]');
        savedPhotos = savedPhotos.filter(photo => photo.id !== id);
        localStorage.setItem('custom_photos', JSON.stringify(savedPhotos));
    }
}

function savePhotoToStorage(id, src, caption) {
    try {
        const savedPhotos = JSON.parse(localStorage.getItem('custom_photos') || '[]');
        savedPhotos.push({ id, src, caption });
        localStorage.setItem('custom_photos', JSON.stringify(savedPhotos));
    } catch (error) {
        alert('La imagen es demasiado pesada para guardarla. Intenta con una imagen más liviana.');
    }
}

function loadSavedPhotos() {
    // Carga únicamente las fotos nuevas agregadas por el usuario, respetando las 6 fijas del HTML
    const savedPhotos = JSON.parse(localStorage.getItem('custom_photos') || '[]');
    savedPhotos.forEach(photo => {
        addDynamicPhotoToGallery(photo.id, photo.src, photo.caption);
    });
}