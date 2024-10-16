// Copyright (c) 2024 YA-androidapp(https://github.com/yzkn) All rights reserved.


// 地図設定
var baseMaps = {
  'Esri(航空写真)': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),

  'OSM': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: 'c OpenStreetMap contributors'
    }),

  '地理院タイル': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。'
    }),
  '淡色地図': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。'
    }),
  '航空写真': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。'
    }),
  '白地図': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。'
    }),
  '色別標高図': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　海域部は海上保安庁海洋情報部の資料を使用して作成'
    }),
  '20万分1土地利用図': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/lum200k/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果です。'
    }),
  '標準地図（英語）': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/english/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。'
    }),

  '地理院地図Vector（道路）': L.maplibreGL({
    style: `style/road.json`,
    attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。'
  }),

  'Google Maps': L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google'
    }),
  'Google Roads': L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google'
    }),
  'Google Satellite': L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google'
    }),
  'Google Satellite Hybrid': L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google'
    }),
  'Google Streets': L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google'
    }),
  'Google Terrain': L.tileLayer('https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google'
    }),
};

var overlayMaps = {
  'OSM 20%': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: 'c OpenStreetMap contributors',
      opacity: 0.2
    }),
  'OSM 40%': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: 'c OpenStreetMap contributors',
      opacity: 0.4
    }),
  '地理院タイル 20%': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。',
      opacity: 0.2
    }),
  '地理院タイル 40%': L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    {
      attribution: '出典：国土地理院ウェブサイト(https://maps.gsi.go.jp/development/ichiran.html)　この地理院タイルは基本測量成果（名称：電子地形図（タイル））です。',
      opacity: 0.4
    }),
  'Google Maps 20%': L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google',
      opacity: 0.2
    }),
  'Google Maps 40%': L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google',
      opacity: 0.4
    }),
  'Google Roads 40%': L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google',
      opacity: 0.4
    }),
  'Google Roads 100%': L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
    {
      attribution: '&copy; Google',
      opacity: 1
    })
};