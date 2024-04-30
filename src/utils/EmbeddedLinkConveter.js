function convertToEmbeddedLink(youtubeLink) {
    var videoId = extractVideoId(youtubeLink);
    if (videoId) {
        return 'http://www.youtube.com/embed/' + videoId + '?yt:stretch=16:9&vq=hd720p&autoplay=1&playlist=' + videoId + '&loop=0&color=red&iv_load_policy=3&rel=0&showinfo=0&autohide=1&controls=0&autoplay=1';
    }
}

function extractVideoId(url) {
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}


export {convertToEmbeddedLink}