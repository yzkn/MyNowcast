class StyleSwitcherControl {
    onAdd(map) {
        this.map = map;

        const switcherButton = document.createElement('button');
        switcherButton.className = 'maplibregl-ctrl-switcher mapboxgl-ctrl-switcher';
        switcherButton.type = 'button';
        switcherButton.innerHTML = '<span id="switcher-button-icon" class="maplibregl-ctrl-icon mapboxgl-ctrl-icon" aria-hidden="true"></span>';
        switcherButton.addEventListener('click', (e) => {
            document.getElementById('switcher-control').style.display = (document.getElementById('switcher-control').style.display == 'block') ? 'none' : 'block';
        });

        this.container = document.createElement('div');
        this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group';
        this.container.appendChild(switcherButton);

        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
