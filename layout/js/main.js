'use strict';

window.tracks = [];

class MyMap {
    constructor(mapid) {
        this.markers = [];
        this.map     = L.map(mapid || 'map', {
            zoomControl: false,
            maxZoom: 18
        }).setView([59.940878, 30.334021], 10);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(this.map);
    }

    zoomIn() {
        var z = this.map.getZoom() + 1;
        this.map.setZoom(z);
    }

    zoomOut() {
        var z = this.map.getZoom() - 1;
        this.map.setZoom(z);
    };

    addMarker(marker) {
        this.markers.push(marker);
        marker.addTo(this.map);
    }
}

class MyMarker extends L.Marker {
    constructor(id, geometry) {
        super([0, 0], { });

        this.id        = id;
        this._index    = 0;
        this._points   = [];
        this._interval = 0.5;

        this._loadpoints(geometry);

        setInterval(() => { 
            this._move()
        }, this._interval * 1000);

        let randomClass = ['text-blue', 'text-red', 'text-green', 'text-yellow'];
        let rci         = Math.floor(Math.random() * 4);

        this.setIcon(L.divIcon({ html: '\
            <div id="' + this.id + '" class="' + randomClass[rci] + '">\
                <div class="ball-marker la-ball-clip-rotate-pulse la-sm">\
                    <div class="la-sm"></div>\
                    <div></div>\
                </div>\
                <div class="marker shadow">\
                    <div class="popup-title">\
                        <strong><span">' + this.id + '</span></strong><br />\
                    </div>\
                    <br/>\
                </div>\
            </div>' 
        }));
    }

    _loadpoints(geometry) {
        switch(geometry.type) {
            case 'LineString': 
                this._points = geometry.coordinates; 
                break;
            case 'MultiLineString':
                for(let i = 0; i < geometry.coordinates.length; i++)
                    this._points = this._points.concat(geometry.coordinates[i]); 
                break;
        }
    }

    _move() {
        if(this._index === this._points.length) {
            this._index = 0;
        }

        let latlng = L.latLng(
            this._points[this._index][1], 
            this._points[this._index][0]);

        this.setLatLng(latlng);

        this._index++;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.mymap = new MyMap('map');

    for(let i = 0; i < window.tracks.length; i++) {
        let marker = new MyMarker(window.tracks[i].id, window.tracks[i].geo);
        window.mymap.addMarker(marker);
    }

    
}, false);