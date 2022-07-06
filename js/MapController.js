class MapController {
    view;

    constructor(mapId, data) {
        this.view = new MapView(mapId);

        this.view.mapIconsToType(
            {
                building: "building.svg",
                train: "train.svg",
                bus: "bus.svg",
            },
            "../assets/svg/"
        );

        this.view.initiateData(data);
        this.view.showMap();
    }
}
