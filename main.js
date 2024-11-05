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

//

// Style switcher
const styles = [
  {
    style: "std",
    title: "標準地図",
    uri: "https://gsi-cyberjapan.github.io/gsivectortile-mapbox-gl-js/std.json"
  },
  {
    style: "pale",
    title: "淡色地図",
    uri: "https://gsi-cyberjapan.github.io/gsivectortile-mapbox-gl-js/pale.json"
  },
  {
    style: "blank",
    title: "白地図",
    uri: "https://gsi-cyberjapan.github.io/gsivectortile-mapbox-gl-js/blank.json"
  }
];
// Style switcher


const parseDateString = (str) => {
  const year = parseInt(str.substring(0, 4));
  const month = parseInt(str.substring(4, 6));
  const day = parseInt(str.substring(6, 8));
  const hour = parseInt(str.substring(8, 10));
  const min = parseInt(str.substring(10, 12));
  const sec = parseInt(str.substring(12, 14));

  const utcDate = new Date(year, month - 1, day, hour, min, sec);
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const currentDate = new Date(utcDate.getTime() - offset);

  return currentDate;
};


const formatDate = (date, format) => {
  format = format.replace(/yyyy/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  return format;
};


const isWebglSupported = () => {
  if (window.WebGLRenderingContext) {
    const canvas = document.createElement('canvas');
    try {
      // Note that { failIfMajorPerformanceCaveat: true } can be passed as a second argument
      // to canvas.getContext(), causing the check to fail if hardware rendering is not available. See
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
      // for more details.
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (context && typeof context.getParameter == 'function') {
        return true;
      }
    } catch (e) {
      // WebGL is supported, but disabled
    }
    return false;
  }
  // WebGL not supported
  return false;
};

//


// MapLibre
const initMap = (s) => {
  const map = new maplibregl.Map({
    container: 'map', // container id
    hash: true,
    // style: './style/pale.json', // style URL
    style: s,
    center: [139.767125, 35.681236], // starting position [lng, lat]
    zoom: 10, // starting zoom
    minZoom: 4,
    maxZoom: 10,
    localIdeographFontFamily: false
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
    'top-right',
  );

  // Style switcher
  map.addControl(new StyleSwitcherControl());
  // Style switcher

  // Nowcast control
  map.addControl(new NowcastControl(), 'top-right');
  // Nowcast control



  map.on('load', () => {
    // Add vector tiles
    map.addSource('All', {
      'type': 'vector',
      'tiles': [
        'https://yzkn.github.io/MyKMLsMap/tiles/{z}/{x}/{y}.pbf'
      ],
      'minzoom': 4,
      'maxzoom': 10
    });
    map.addLayer(
      {
        'id': 'All',
        'type': 'line',
        'source': 'All',
        'source-layer': 'All',
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-opacity': 0.8,
          'line-color': 'rgb(255, 0, 0)',
          'line-width': 1
        }
      }
    );
    // Add vector tiles


    // Add Nowcast tiles
    const NOWCAST_URL = 'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N2.json';
    const RASRF_URL = 'https://www.jma.go.jp/bosai/jmatile/data/rasrf/targetTimes.json';
    let nowcastSources = [];

    fetch(NOWCAST_URL)
      .then(function (data) {
        return data.json();
      })
      .then(function (json) {
        // 最小値を取得にはjson[0].validtime
        json.sort(function (a, b) {
          return a.validtime - b.validtime;
        });

        json.forEach(element => {
          const basetime = element.basetime;
          const validtime = element.validtime;
          const sourceId = `Nowcast${basetime}${validtime}`;

          nowcastSources.push({ id: sourceId, validtime: validtime });
          map.addSource(sourceId, {
            'type': 'raster',
            'tiles': [
              `https://www.jma.go.jp/bosai/jmatile/data/nowc/${element.basetime}/none/${element.validtime}/surf/hrpns/{z}/{x}/{y}.png`
            ],
            'minzoom': 4,
            'maxzoom': 10
          });
          map.addLayer(
            {
              'id': sourceId,
              'type': 'raster',
              'source': sourceId,
              'source-layer': sourceId
            }
          );
          map.setLayoutProperty(sourceId, 'visibility', 'none');
          map.setPaintProperty(sourceId, "raster-opacity", 1);
        });

        const lastValidTime = nowcastSources[nowcastSources.length - 1]['validtime'];

        fetch(RASRF_URL)
          .then(function (data) {
            return data.json();
          })
          .then(function (json) {
            // 最小値を取得にはjson[0].validtime
            json.sort(function (a, b) {
              return a.validtime - b.validtime;
            });

            json
              .filter(element => element.validtime > lastValidTime)
              .forEach(element => {
                const basetime = element.basetime;
                const validtime = element.validtime;
                const sourceId = `Rasrf${basetime}${validtime}`;

                nowcastSources.push({ id: sourceId, validtime: validtime });
                map.addSource(sourceId, {
                  'type': 'raster',
                  'tiles': [
                    `https://www.jma.go.jp/bosai/jmatile/data/rasrf/${element.basetime}/${element.member}/${element.validtime}/surf/rasrf/{z}/{x}/{y}.png`
                  ],
                  'minzoom': 4,
                  'maxzoom': 10
                });
                map.addLayer(
                  {
                    'id': sourceId,
                    'type': 'raster',
                    'source': sourceId,
                    'source-layer': sourceId
                  }
                );
                map.setLayoutProperty(sourceId, 'visibility', 'none');
                map.setPaintProperty(sourceId, "raster-opacity", 1);
              });

            // Nowcast control
            console.log('nowcastSources', nowcastSources);
            document.getElementById('nowcast-slider').max = nowcastSources.length - 1;

            document.getElementById('nowcast-slider').addEventListener('change', () => {
              document.getElementById('nowcast-datetime').innerHTML =
                (nowcastSources[document.getElementById('nowcast-slider').value]['id'].startsWith('Nowcast') ? '<font color="#4caf50">' : '<font color="#3f51b5">') +
                formatDate(parseDateString(nowcastSources[document.getElementById('nowcast-slider').value]['validtime']), 'MM/dd HH:mm') +
                '</font>';

              nowcastSources.forEach(item => {
                map.setLayoutProperty(item['id'], 'visibility', 'none');
              });
              map.setLayoutProperty(nowcastSources[document.getElementById('nowcast-slider').value]['id'], 'visibility', 'visible');
            }, false);
            document.getElementById('nowcast-datetime').innerHTML =
              '<font color="#4caf50">' +
              formatDate(parseDateString(nowcastSources[0]['validtime']), 'MM/dd HH:mm') +
              '</font>';
            map.setLayoutProperty(nowcastSources[0]['id'], 'visibility', 'visible');
            // Nowcast control
          });
      });
    // Add Nowcast tiles
  });
}


const initMapAll = (s) => {
  const map = new maplibregl.Map({
    container: 'map', // container id
    hash: true,
    // style: './style/pale.json', // style URL
    style: s,
    center: [139.767125, 35.681236], // starting position [lng, lat]
    zoom: 10, // starting zoom
    minZoom: 4,
    maxZoom: 10,
    localIdeographFontFamily: false
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
    'top-right',
  );

  // Style switcher
  map.addControl(new StyleSwitcherControl());
  // Style switcher

  // Nowcast control
  map.addControl(new NowcastControl(), 'top-right');
  // Nowcast control



  map.on('load', () => {
    // Add vector tiles
    map.addSource('All', {
      'type': 'vector',
      'tiles': [
        'https://yzkn.github.io/MyKMLsMap/tiles/{z}/{x}/{y}.pbf'
      ],
      'minzoom': 4,
      'maxzoom': 10
    });
    map.addLayer(
      {
        'id': 'All',
        'type': 'line',
        'source': 'All',
        'source-layer': 'All',
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-opacity': 0.8,
          'line-color': 'rgb(255, 0, 0)',
          'line-width': 1
        }
      }
    );
    // Add vector tiles


    // Add Nowcast tiles
    const NOWCAST_URL = 'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N2.json';
    const RASRF_URL = 'https://www.jma.go.jp/bosai/jmatile/data/rasrf/targetTimes.json';
    let nowcastSources = [];

    fetch(NOWCAST_URL)
      .then(function (data) {
        return data.json();
      })
      .then(function (json) {
        // 最小値を取得にはjson[0].validtime
        json.sort(function (a, b) {
          return a.validtime - b.validtime;
        });

        let isFirst = true;
        json.forEach(element => {
          const basetime = element.basetime;
          const validtime = element.validtime;
          const sourceId = `Nowcast${basetime}${validtime}`;

          nowcastSources.push({ id: sourceId, validtime: validtime });
          map.addSource(sourceId, {
            'type': 'raster',
            'tiles': [
              `https://www.jma.go.jp/bosai/jmatile/data/nowc/${element.basetime}/none/${element.validtime}/surf/hrpns/{z}/{x}/{y}.png`
            ],
            'minzoom': 4,
            'maxzoom': 10
          });
          map.addLayer(
            {
              'id': sourceId,
              'type': 'raster',
              'source': sourceId,
              'source-layer': sourceId
            }
          );
          map.setLayoutProperty(sourceId, 'visibility', isFirst ? 'visible' : 'none');
          map.setPaintProperty(sourceId, "raster-opacity", 0.4);
          isFirst = false;
        });

        const lastValidTime = nowcastSources[nowcastSources.length - 1]['validtime'];

        fetch(RASRF_URL)
          .then(function (data) {
            return data.json();
          })
          .then(function (json) {
            // 最小値を取得にはjson[0].validtime
            json.sort(function (a, b) {
              return a.validtime - b.validtime;
            });

            json
              .filter(element => element.validtime > lastValidTime)
              .forEach(element => {
                const basetime = element.basetime;
                const validtime = element.validtime;
                const sourceId = `Rasrf${basetime}${validtime}`;

                nowcastSources.push({ id: sourceId, validtime: validtime });
                map.addSource(sourceId, {
                  'type': 'raster',
                  'tiles': [
                    `https://www.jma.go.jp/bosai/jmatile/data/rasrf/${element.basetime}/${element.member}/${element.validtime}/surf/rasrf/{z}/{x}/{y}.png`
                  ],
                  'minzoom': 4,
                  'maxzoom': 10
                });
                map.addLayer(
                  {
                    'id': sourceId,
                    'type': 'raster',
                    'source': sourceId,
                    'source-layer': sourceId
                  }
                );
                map.setLayoutProperty(sourceId, 'visibility', 'none');
                map.setPaintProperty(sourceId, "raster-opacity", 0.2);
              });

            // Nowcast control
            console.log('nowcastSources', nowcastSources);
            document.getElementById('nowcast-slider').max = nowcastSources.length - 1;

            document.getElementById('nowcast-slider').addEventListener('change', () => {
              document.getElementById('nowcast-datetime').innerHTML =
                (nowcastSources[document.getElementById('nowcast-slider').value]['id'].startsWith('Nowcast') ? '<font color="#4caf50">' : '<font color="#3f51b5">') +
                formatDate(parseDateString(nowcastSources[document.getElementById('nowcast-slider').value]['validtime']), 'MM/dd HH:mm') +
                'まで'
              '</font>';

              let isPast = true;
              nowcastSources.forEach(item => {
                map.setLayoutProperty(item['id'], 'visibility', isPast ? 'visible' : 'none');
                if (item['id'] == nowcastSources[document.getElementById('nowcast-slider').value]['id']) {
                  console.log(item['id'], nowcastSources[document.getElementById('nowcast-slider').value]['id'])
                  isPast = false;
                }
              });
            }, false);
            document.getElementById('nowcast-datetime').innerHTML =
              '<font color="#4caf50">' +
              formatDate(parseDateString(nowcastSources[0]['validtime']), 'MM/dd HH:mm') +
              '</font>';
            map.setLayoutProperty(nowcastSources[0]['id'], 'visibility', 'visible');
            // Nowcast control
          });
      });
    // Add Nowcast tiles
  });
}

window.addEventListener('DOMContentLoaded', (event) => {
  const searchParams = new URLSearchParams(window.location.search);


  // Style switcher
  const select = document.getElementById('style-switch');
  select.innerHTML = '';
  styles.forEach(s => {
    const option = document.createElement('option');
    option.value = s.style;
    option.textContent = s.title;
    if ((searchParams.has('style')) && (searchParams.get('style') == s.style)) {
      option.selected = 'selected';
    }
    select.appendChild(option);
  });
  select.addEventListener('change', (e) => {
    const selectedStyle = e.target.value;
    window.location = location.pathname + '?style=' + selectedStyle;
  });
  // Style switcher


  if (!isWebglSupported()) {
    alert('Your browser does not support MapLibre GL');
  } else {
    const selectedStyle = document.getElementById('style-switch').value;
    if (location.search.includes('all')) {
      initMapAll(
        styles.find((v) => v.style === selectedStyle)['uri']
      );
    } else {
      initMap(
        styles.find((v) => v.style === selectedStyle)['uri']
      );
    }
  }
});
