const form = document.querySelector('#frame-form');
const preview = document.querySelector('#preview');
const previewWrapper = document.querySelector('.preview-wrapper');
const previewImg = document.querySelector('#preview img');
const filename = document.querySelector('#filename');
const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
const opacityInput = document.querySelector('#opacity');

let imgSrc = '';

function loadImage(e) {
	const file = e.target.files[0];

	if (!isFileImage(file)) {
		alertError('Please select an image');
		return;
	}

	// Get original dimensions
	const image = new Image();
	imgSrc = URL.createObjectURL(file);
	image.src = imgSrc;
	image.onload = function () {
		widthInput.value = this.width;
		heightInput.value = this.height;
		opacityInput.value = 0.5;
	};

	previewWrapper.classList.add('show');
	previewImg.src = imgSrc;

	filename.innerText = file.name;
}

// Send image data to main
function sendImage(e) {
	e.preventDefault();

	const width = widthInput.value;
	const height = heightInput.value;
	const opacity = opacityInput.value;

	if (!img.files[0]) {
		alertError('Please upload an image');
		return;
	}

	if (width === '') {
		alertError('Please fill in a width');
		return;
	}

	// Send the porperties to create the design frame (window)
	ipcRenderer.send('image:designFrame', {
		width,
		height,
		opacity,
	});
}

function renderImage(e) {
	e.preventDefault();

	const width = widthInput.value;

	// Render the actual image (not window) in the frame window
	ipcRenderer.send('image:render', {
		width,
		imgSrc,
	});
}

// Catch the image:rendered event
ipcRenderer.on('image:created', () => {
	alertSuccess(`Frame opened in resolution ${widthInput.value} x ${heightInput.value}`);
});

// Make sure file is image
function isFileImage(file) {
	const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/webp'];
	return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
	Toastify.toast({
		text: message,
		duration: 5000,
		close: false,
		style: {
			background: 'var(--gradient-red)',
			color: 'white',
			textAlign: 'center',
		},
	});
}

function alertSuccess(message) {
	Toastify.toast({
		text: message,
		duration: 5000,
		close: false,
		style: {
			background: 'var(--gradient-green)',
			color: 'white',
			textAlign: 'center',
		},
	});
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
form.addEventListener('submit', renderImage);

document.querySelector('.mode').addEventListener('click', () => {
	const htmlElement = document.documentElement;
	const modeButton = document.querySelector('.mode');

	htmlElement.classList.toggle('dark');
});
