import type {FillLayer} from 'react-map-gl';
import type {LineLayer} from "react-map-gl";

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer: FillLayer = {
  id: 'fills',
  type: 'fill',
  paint: {
    'fill-color': ['get', 'color'], // Use the 'color' property from each feature
    'fill-opacity': 0.6
  }
};

export const lineLayer: LineLayer = {
    id: 'lines',
    type: 'line',
    paint: {
        'line-color': 'black',
        'line-opacity': 0.6,
        'line-width': ['get', 'lineThickness']
    }
}
