import * as React from 'react';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {render} from 'react-dom';
import Map, {Source, Layer} from 'react-map-gl';
import ControlPanel from './control-panel';

import {dataLayer, lineLayer} from './map-style';
import {updatePercentiles} from './utils';
import {LineFeed} from "ts-loader/dist/constants";


export default function App() {
    const [yearMonth, setYearMonth] = useState("2024-01");
    const [zoneData, setZoneData] = useState(null);
    const [trafficData, setTrafficData] = useState(null);
    const [mapboxToken, setMAPBOX_TOKEN] = useState("");
    const [tokenReceived, setTokenReceived] = useState(false);


    useEffect(() => {
        fetch(
            'http://localhost:3000/mapbox_token'
        )
            .then(resp => resp.json())
            .then(json => setMAPBOX_TOKEN(json.tokenKey))
            .catch(err => console.error('Could not load data', err));
        console.log("assumed fetched token", mapboxToken);
    }, []);

    useEffect(() => {

        if (mapboxToken !== "") {
            setTokenReceived(true);
            console.log("must fetched token", mapboxToken);
        }
    }, [mapboxToken]);

    useEffect(() => {
        fetch(
            'http://localhost:3000/taxi_zones'
        )
            .then(resp => resp.json())
            .then(json => setZoneData(json))
            .catch(err => console.error('Could not load data', err));
    }, []);


    useEffect(() => {
        fetch(
            'http://localhost:3000/data_from_local/' + yearMonth
        )
            .then(resp => resp.json())
            .then(json => setTrafficData(json))
            .catch(err => console.error('Could not load data', err));
    }, [yearMonth]);


    useEffect(() => {
        console.log(yearMonth);
    }, [yearMonth]);

    useEffect(() => {
        console.log(zoneData);
    }, [zoneData]);

    useEffect(() => {
        console.log(trafficData);
    }, [trafficData]);

    const initialViewState = {
        latitude: 40.7128,
        longitude: -74.0060,
        zoom: 10
    }

    return (
        <>
            {tokenReceived &&
                <>
                    <Map initialViewState={initialViewState}
                         mapStyle="mapbox://styles/mapbox/light-v9"
                         mapboxAccessToken={mapboxToken}
                         interactiveLayerIds={['data']}
                    >

                        <Source type="geojson" data={zoneData}>
                            <Layer {...dataLayer} />
                        </Source>

                        <Source type="geojson" data={trafficData}>
                            <Layer {...lineLayer} />
                        </Source>
                    </Map>

                    <ControlPanel year={yearMonth} onChange={value => setYearMonth(value)}/>
                </>
            }
        </>
    );
}

export function renderToDom(container) {
    render(<App/>, container);
}
