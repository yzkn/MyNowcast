// Copyright (c) 2024 YA-androidapp(https://github.com/yzkn) All rights reserved.


import './style.css'


// MapLibre
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { NavigationControl, ScaleControl } from 'maplibre-gl';

// https://github.com/watergis/maplibre-gl-export
import {
  MaplibreExportControl,
  Size,
  PageOrientation,
  Format,
  DPI
} from '@watergis/maplibre-gl-export';
import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';

// https://github.com/maplibre/maplibre-gl-geocoder
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

// https://github.com/mug-jp/maplibre-gl-temporal-control
import TemporalControl from 'maplibre-gl-temporal-control';

//


// MapLibre
const map = new maplibregl.Map({
  container: 'map', // container id
  style: './style/pale.json', // style URL
  center: [139.767125, 35.681236], // starting position [lng, lat]
  zoom: 10 // starting zoom
});

map.addControl(
  new NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true
  }),
  'bottom-right'
);

map.addControl(
  new ScaleControl()
);

// https://github.com/watergis/maplibre-gl-export
const exportControl = new MaplibreExportControl({
  PageSize: Size.A3,
  PageOrientation: PageOrientation.Portrait,
  Format: Format.PNG,
  DPI: DPI[96],
  Crosshair: true,
  PrintableArea: true,
  Local: 'ja',

});
map.addControl(exportControl, 'bottom-right');

// https://github.com/maplibre/maplibre-gl-geocoder
map.addControl(
  new MaplibreGeocoder({
    forwardGeocode: async (config) => {
      const term = config.query;
      const response = await fetch(
        `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(term)}`
      );
      if (!response.ok) {
        return {};
      }
      const resultJson = await response.json();
      const features = resultJson.map(({ geometry: { coordinates: center }, properties }) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center,
        },
        place_name: properties.title,
        center
      }));

      return {
        features,
      };
    },
  }, {
    maplibregl: maplibregl,
    marker: false,
    showResultsWhileTyping: true,
    placeholder: '地名検索',
    reverseGeocode: true,
  }),
  'top-left',
);