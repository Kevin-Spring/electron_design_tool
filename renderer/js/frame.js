const designFrame = document.querySelector('#design-frame');

// Catch the image:rendered from main and create the image in frameWindow
ipcRenderer.on('image:rendered', ({ width, imgSrc }) => {
	const image = new Image();
	image.src = imgSrc;
	designFrame.appendChild(image);

	designFrame.style.width = width + 'px';
});
