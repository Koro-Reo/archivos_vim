axios.get('https://jsonplaceholder.typicode.com/todos/1')
  .then(function (response) {
    console.log(response.data); // Accede directamente a los datos
  })
  .catch(function (error) {
    console.error(error);
  });
var videosId = {};
// Función para obtener el ID del canal a partir de la URL
async function getChannelIdFromUrl(url) {
    console.log("Intentando conseguir id de: " + url);
    let channelId;

    try {
        // Sanitize the URL
        url = url.split('?')[0]; // Remueve parámetros adicionales si los hay

        // Verificar si contiene @handle
        if (url.includes('@')) {
            const handle = url.split('@')[1].split('/')[0];
            const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=`);
            if (response.data.items && response.data.items.length > 0) {
                channelId = response.data.items[0].id;
            } else {
                throw new Error('No se encontró el canal para el handle dado.');
            }
        } else if (url.includes('/channel/')) {
            // Check if the URL has /channel/ (which already contains the channel ID)
            channelId = url.split('/channel/')[1].split('/')[0]; // Asegura que solo se tome el ID
        } else if (url.includes('/user/')) {
            const username = url.split('/user/')[1].split('/')[0];
            const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=`);
            if (response.data.items && response.data.items.length > 0) {
                channelId = response.data.items[0].id;
            } else {
                throw new Error('No se encontró el canal para el nombre de usuario dado.');
            }
        } else if (url.includes('/c/')) {
            const channelName = url.split('/c/')[1].split('/')[0];
            const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${channelName}&type=channel&key=`);
            if (response.data.items && response.data.items.length > 0) {
                channelId = response.data.items[0].snippet.channelId;
            } else {
                throw new Error('No se encontró el canal para el nombre dado.');
            }
        }
    } catch (error) {
        console.error('Error al obtener el ID del canal:', error);
    }

    return channelId;
}

// Función para obtener las playlists públicas de un canal
async function getPublicPlaylists(channelId) {
    try {
        const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=6&key=`);
        return response.data.items;
    } catch (error) {
        console.error('Error al obtener las listas de reproducción públicas:', error);
        return [];
    }
}

// Función para obtener los videos de una playlist
async function getPlaylistVideos(playlistId) {
    Ids_videos_pl = videosId [playlistId];
    var videos_string = Ids_videos_pl.join(",");
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&part=contentDetails&id=${videos_string}&key=`)
    console.log(response);
    return response.data.items;
}

// Evento del formulario
document.getElementById("channelForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    var url = document.getElementById("channel-url").value;
    console.log(url);
    
    async function checkPlaylistVideos(playlistId, maxChecks = 4) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems`;
        let privateOrDeletedCount = 0;

        try {
            const response = await axios.get(`${apiUrl}?part=status,snippet&maxResults=${maxChecks}&playlistId=${playlistId}&key=`);
            const data = response.data;
            
            if (data.items && data.items.length > 0) {
                var listId = [];
                for (const item of data.items) {              
                    if (item.status.privacyStatus === 'private' || !item.snippet.title) {
                        privateOrDeletedCount++;
                    } else {
                           console.log(item.snippet.resourceId.videoId);
                           listId.push(item.snippet.resourceId.videoId);
                           const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videosId}&key=`)
                    }
                }
                videosId [playlistId] = listId;
                console.log(videosId);
            } else {
                console.log(`No se encontraron videos en la playlist ${playlistId}`);
                return false;
            }

            const privateOrDeletedRatio = privateOrDeletedCount / Math.min(maxChecks, data.items.length);
            console.log(`Playlist ${playlistId}: ${privateOrDeletedCount} de ${data.items.length} videos son privados o fueron eliminados.`);
            
            return privateOrDeletedRatio < 0.5; // Retorna true si menos de la mitad son privados/eliminados
        } catch (error) {
            console.error(`Error al verificar la playlist ${playlistId}:`, error);
            return false;
        }
    }

    try {
        console.log("Intentando conseguir ID");
        const channelId = await getChannelIdFromUrl(url);
        if (channelId) {
            console.log('Channel ID:', channelId);
            const playlists = await getPublicPlaylists(channelId);
            if (playlists.length > 0) {
                console.log('Playlists:', playlists);
                const playlistContainer = document.getElementById('playlist-videos');
                playlistContainer.innerHTML = ''; // Limpiar contenido anterior
                
                let validPlaylistsCount = 0;
                for (const playlist of playlists) {
                    if (validPlaylistsCount >= 4) break; // Limitar a 3 playlists válidas

                    const playlistId = playlist.id;
                    const isPlaylistValid = await checkPlaylistVideos(playlistId);
                    
                    if (isPlaylistValid) {
                        validPlaylistsCount++;
                        const playlistVideos = await getPlaylistVideos(playlistId);
                        
                        playlistContainer.innerHTML += `
                            <div class="playlist-item col-3">
                                <h2>Playlist: ${playlist.snippet.title}</h2>
                                <div class="videos-container" id="videos-${playlistId}">
                                </div>
                            </div>
                        `;
                        
                        const videosContainer = document.getElementById(`videos-${playlistId}`);
                        const limitedVideos = playlistVideos.slice(0, 4);
                        
                        if (limitedVideos.length > 0) {
    limitedVideos.forEach(video => {
        if (video.snippet && video.snippet.title) {
            videosContainer.innerHTML += `
                <div class="video-item row">
                
                <div class="col-4 align-self-center p-0">                    
                    <img class="w-100" src="${video.snippet.thumbnails.standard.url}" alt="${video.snippet.title}">
                </div>             
                <div class="col d-flex flex-column align-self-center">
                    <div>
                    <span><b>${video.snippet.title}</b></span><br>       
                    <span>${isoToHMS(video.contentDetails.duration)}<span>
                    </div>
                </div>
                </div>
            `;
        }
    });
} else {
    videosContainer.innerHTML = '<p>No se encontraron videos válidos en esta lista de reproducción.</p>';
}
                    
                    } else {
                        console.log(`La playlist ${playlistId} será ignorada debido a muchos videos privados o eliminados.`);
                    }
                }
                
                if (validPlaylistsCount === 0) {
                    playlistContainer.innerHTML = '<p>No se encontraron listas de reproducción válidas.</p>';
                }
            } else {
                console.log('No se encontraron listas de reproducción públicas.');
            }
        } else {
            console.log('No se pudo obtener el ID del canal.');
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
    }
});



// Convierte formato ISO 8601 en horas minutos segundos

function isoToHMS(isoString) {
  // Expresión regular para extraer horas, minutos y segundos
  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const match = isoString.match(regex);

  if (!match) {
    return "Formato ISO 8601 inválido";
  }

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  let result = "";

  if (hours > 0) {
    result += `${hours} hora${hours !== 1 ? 's' : ''}, `;
  }
  if (minutes > 0) {
    result += `${minutes} minuto${minutes !== 1 ? 's' : ''}, `;
  }
  if (seconds > 0) {
    result += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
  }

  // Eliminar la última coma y espacio si es necesario
  return result.trim().replace(/,$/, '');
}
