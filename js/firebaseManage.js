const database = firebase.database();

function savePixel(x,y,key, color) {
    
    const pixelRef = database.ref('pixels/' + key);
    
    pixelRef.set({
        x: x,
        y: y,
        color: color,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log(`Pixel guardado en (${x}, ${y}) con color: ${color}`);
    })
    .catch((error) => {
        console.error('Error al guardar pixel:', error);
    });
}


function removePixel(key) {
    const pixelRef = database.ref('pixels/' + key);
       pixelRef.remove()
        .then(() => {
            console.log("se eliminó el pixel");
        })
        .catch((error) => {
            console.error("Error al eliminar el pixel", error);
        }); 
}

function pixelSocket() {
    const pixelsRef = database.ref('pixels');
    
    pixelsRef.on('child_added', (snapshot) => {
        const pixel = snapshot.val();
        const key = snapshot.key;
        console.log('Pixel añadido:', pixel);
        
        colorHistory[key] = pixel.color;
        draw();
    });
    
    pixelsRef.on('child_changed', (snapshot) => {
        const pixel = snapshot.val();
        const key = snapshot.key;
        console.log('Pixel modificado:', pixel);
        
        colorHistory[key] = pixel.color;
        draw();
    });
    
    pixelsRef.on('child_removed', (snapshot) => {
        const key = snapshot.key;
        console.log('Pixel eliminado:', key);
        
        if (colorHistory[key]) {
            delete colorHistory[key];
            draw();
        }
    });
}

function loadPixels() {
    const pixelsRef = database.ref('pixels');
    
    pixelsRef.once('value')
        .then((snapshot) => {
            const pixels = snapshot.val();
            if (pixels) {
                console.log('Cargando pixels existentes...');
                
                for (const key in colorHistory) {
                    delete colorHistory[key];
                }
                
                Object.keys(pixels).forEach(key => {
                    const pixel = pixels[key];
                    colorHistory[key] = pixel.color;
                });
                
                console.log('Pixels cargados:', Object.keys(colorHistory).length);
                draw(); 
            }
        })
        .catch((error) => {
            console.error('Error al cargar pixels:', error);
        });
}