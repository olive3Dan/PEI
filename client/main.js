import './style.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import {Icon, Style, Text, Fill, Stroke} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';
import {Select, defaults as defaultInteractions, DoubleClickZoom} from 'ol/interaction';
import {click, pointerMove} from 'ol/events/condition.js';
import { get } from 'ol/style/IconImage';

// 1. PONTOS
const pointStyleNormal = feature => {
    const label = feature.get('label');
    return new Style({
        image: new Icon({
            src: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            anchor: [0.5, 1],
            scale: 1,
        }),
        text: new Text({
            font: '12px sans-serif',
            text: label,
            offsetX: 0,
            offsetY: -40,
            fill: new Fill({
                color: '#000',
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 3,
            }),
        }),
    });
};
const pointStyleSelected = feature => {
    const label = feature.get('label');
    return new Style({
        image: new Icon({
            src: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            anchor: [0.5, 1],
            scale: 1.2,
        }),
        text: new Text({
            font: '12px sans-serif',
            text: label,
            offsetX: 0,
            offsetY: -40,
            fill: new Fill({
                color: '#000',
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 3,
            }),
        }),
    });
};
const loadPoints = async (pointLayer) => {
  try {
    const response = await fetch('http://localhost:3000/points');
    const points = await response.json();

    points.forEach(point => {
      addPointToMap(pointLayer, point.id, point.name, point.coordinates);
    });
  } catch (error) {
    console.error(error);
  }
}
const addPointToMap = (layer, id, label, coordinate) => {
  const pointFeature = new Feature({
        geometry: new Point(fromLonLat(coordinate)),
    });
    pointFeature.set('label', label);
    pointFeature.set('id', id);
    layer.getSource().addFeature(pointFeature);

};
const addPointToDataBase = async (name, coordinates) => {
  let lon =  coordinates[0];
  let lat = coordinates[1];
  let request = JSON.stringify({
    name: name,
    lon: coordinates[0],
    lat: coordinates[1]
  });
  const response = await fetch("http://localhost:3000/add_point", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: request
  });
  if (!response.ok) {
    throw new Error("Failed to add point to database");
  }
  const result = await response.json();
  return result.id;
};
const removePointFromDataBase = async (id) => {
  const response = await fetch(`http://localhost:3000/points/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  console.log("ponto removido da BD");
  return true;
};
const removeSelectedPointFromMap = async () => {
  let selectedFeatures = selectClick.getFeatures().getArray();
  if (selectedFeatures.length == 0) return null
  let selectedFeature = selectedFeatures[0];
  let id = selectedFeature.get('id');
  await pointLayer.getSource().removeFeature(selectedFeature);
  return id;
};

  

//INTERACOES
const interactions = defaultInteractions().getArray().filter((interaction) => !(interaction instanceof DoubleClickZoom));
const selectClick = new Select({
  condition: click,
  style: pointStyleSelected,
});

//2. CAMADAS
const pointLayer = new VectorLayer({
  source: new VectorSource(),
  style: pointStyleNormal,
});

//MAPA
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    pointLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  }),
  interactions: interactions
});
map.addInteraction(selectClick);

//EVENTOS
map.on('dblclick', (evt) => addPoint(evt));
map.on('pointermove', (event) => {
  const pixel = event.pixel;
  const hit = map.hasFeatureAtPixel(pixel, {
      layerFilter: (layer) => layer === pointLayer,
  });
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
})
document.addEventListener('keydown', (evt) => removePoint(evt), false);

loadPoints(pointLayer);
alert(`Adicionar um ponto : Double Click \n
       Selecionar um ponto : Single Click \n
       Eliminar um ponto : DELETE KEY
`);
function addPoint(evt){
    const lonLat = toLonLat(evt.coordinate);
    const name = prompt('Point name: ');
    const id = addPointToDataBase(name, lonLat);
    addPointToMap(pointLayer, id, name, lonLat);
}
async function removePoint(evt) {
  if (evt.key !== 'Delete') return;
  console.log("Delete");

  const id = await removeSelectedPointFromMap();

  if (!Number.isInteger(id)) {
    console.log("Invalid id: " + id);
    return;
  }

  console.log("feature id: " + id);

  let pointRemoved = removePointFromDataBase(id);
  
  if (!pointRemoved) {
    console.log("Não foi possível eliminar ponto da Base de dados");
    // addPointToMap(pointLayer, id, selecte);
    return;
  }

  console.log("Ponto eliminado");
}