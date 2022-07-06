class MapView {
    _map;
    _mapEl;
    _infoEl;
    _data;
    _markers = [];
    _iconsMap = {};
    _clusters = [];
    _options = {
        markerInfoDelay: 0,
        makeClusters: false,
    };

    constructor(id) {
        this._mapEl = document.getElementById(id);
        this._infoEl = document.querySelector(".marker-info");
        this._initiateMapOptions();
        this._initiateMarkerInfoOptions();
        this._initHandlerCloseInfoWindow();
    }

    reOpenInfo() {
        if (this._options.markerInfoDelay) {
            this.closeInfo();
            setTimeout(() => this.openInfo(), this._options.markerInfoDelay);
        }
    }

    openInfo() {
        const isOpen = this._infoEl.classList.contains("open");
        if (isOpen) {
            this.reOpenInfo();
        } else {
            this._infoEl.classList.add("open");
        }
    }

    closeInfo() {
        this._infoEl.classList.remove("open");
    }

    setInfo(markerInfo) {
        const el = this._infoEl;
        const keyElements = el.querySelectorAll(".marker-info-target");

        keyElements.forEach((el) => {
            const key = el.dataset.key;

            const info = markerInfo[key];
            if (!info) return;

            el.textContent = info;
        });
    }

    setMarkers(data) {
        this._markers = data.map((m) => {
            const {
                id,
                type,
                coords: [lat, lng],
            } = m;

            const position = { lat, lng };

            const icon = {
                url: this._iconsMap[type],
                scaledSize: new google.maps.Size(25, 25),

                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 0),
            };

            const marker = new google.maps.Marker({
                position,
                map: this._map,
                id,
                icon,
            });

            console.log(marker);

            marker.addListener("click", () => {
                this.setInfo(m);
                this.openInfo();
                this._map.panTo(position);
            });

            return marker;
        });
    }

    makeClusters(clusterName) {
        this._clusters.push({
            name: clusterName,
            cluster: new markerClusterer.MarkerClusterer({
                map: this._map,
                markers: this._markers,
                onClusterClick: (_, cluster, map) => {
                    map.fitBounds(cluster.bounds);
                    this.closeInfo();
                },
            }),
        });
    }

    mapIconsToType(map, folder) {
        this._iconsMap = Object.entries(map).reduce(
            (acc, [key, fileName]) => ({ ...acc, [key]: folder + fileName }),
            {}
        );
    }

    showMap() {
        this._map = new google.maps.Map(this._mapEl, this._getInitialOptions());

        if (this._data) {
            this.setMarkers(this._data);
        }

        if (this._options.makeClusters) {
            this.makeClusters("initial");
        }
    }

    initiateData(data) {
        this._data = data;
    }

    _getInitialOptions() {
        const { initLat, initLng, initZoom } = this._mapEl.dataset;
        return { zoom: +initZoom, center: { lat: +initLat, lng: +initLng } };
    }

    _initiateMarkerInfoOptions() {
        const infoEl = this._infoEl;
        if (!infoEl) return;

        const { delay } = infoEl.dataset;

        if (+delay) {
            this._options.markerInfoDelay = +delay;
        }
    }

    _initiateMapOptions() {
        if (!this._mapEl) return;

        const { cluster } = this._mapEl.dataset;

        if (cluster === "true") {
            this._options.makeClusters = true;
        }
    }

    _initHandlerCloseInfoWindow() {
        const btn = this._infoEl.querySelector(".marker-info-close");
        if (!btn) return;

        btn.addEventListener("click", this.closeInfo.bind(this));
    }
}
