(function() {
    var loadGoogleMapsSDK = function(callback) {
        var key = 'AIzaSyD8300qHsE16MabUWxLWCATV2MVzIaL6rI';
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = callback;
        script.src = '//maps.googleapis.com/maps/api/js?key=' + key;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    var loadJQuery = function(callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = callback;
        script.src = '//cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js';
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    var getStationLocation = function(name, callback) {
        fetch('/api/v5/stations?context=search&q=' + name).then(function(response) {
            return response.json();
        }).then(function(result) {
            return callback(result.stations[0]);
        });
    };

    var getCityDescription = function(name, callback) {
        $.getJSON('//fr.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + name + '&callback=?', function(result) {
            for (var key in result.query.pages)
                return callback(result.query.pages[key].extract);
        });
    };

    var createMap = function(element) {
        var map = new google.maps.Map(element, {
            zoom: 4,
            center: new google.maps.LatLng(46.8665505, 4.566368),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        map.infoWindow = new google.maps.InfoWindow();

        return map;
    };

    var departure = {
        marker: null,
        station: null
    };

    var arrival = {
        marker: null,
        station: null
    };

    var placeMarker = function(map, location, name) {
        if (location.marker)
            location.marker.setMap(null);

        location.marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.station.latitude, location.station.longitude),
            map: map
        });

        google.maps.event.addListener(location.marker, 'click', function() {
            getCityDescription(location.station.name, function(description) {
                map.infoWindow.setContent('<div>' +
                    '<h1>' + location.station.name + '</h1>' +
                    (description ? ('<div>' + description + '</div>') : '') +
                '</div>');
                map.infoWindow.open(map, location.marker);
            });
        });
    };

    var isStationValid = function(element) {
        return element.classList.contains('search__field--valid');
    };

    var setStationChangeHandler = function(selector, validator, callback) {
        var input = document.querySelector(selector);

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (validator(mutation.target))
                    getStationLocation(mutation.target.value, callback);
          });
        });

        observer.observe(input, { attributes: true });
    };

    loadGoogleMapsSDK(function() {
        setTimeout(function() {
            var target = document.createElement('div')
            var refNode = document.querySelector('div.search__section--date');
            target.id = 'map';
            refNode.parentNode.insertBefore(target, refNode);

            var map = createMap(target);

            setStationChangeHandler('input[name=departure]', isStationValid, function(station) {
                departure.station = station;
                placeMarker(map, departure);
            });

            setStationChangeHandler('input[name=arrival]', isStationValid, function(station) {
                arrival.station = station;
                placeMarker(map, arrival);
            });
        }, 1000);
    });

    loadJQuery();
}());
