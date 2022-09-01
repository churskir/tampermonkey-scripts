// ==UserScript==
// @name         Audi search result filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Custom Audi used cars search result filter
// @author       Radosław Churski
// @match        https://www.audi.pl/pl/web/pl/wyszukiwarka-samochodow-uzywanych/wyniki.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=audi.pl
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    const requestedFeatureSets = [
        ["Power seats in front including memory feature for the driver seat"],
        ["Alcantara/leather combination", "Fabric \"System\""]
    ];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchAsync(url) {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }

    function validateFeature(featureSet, carFeatures) {
        return carFeatures.some((carFeature) => featureSet.some((featureFromSet) => carFeature === featureFromSet));
    }

    async function suits(t) {
        const carId = t.getAttribute("data-vehicle-id");
        if (!!carId) {
            const features = (await (await fetchAsync(`https://scs.audi.de/api/v1/vehicles/vehicle/pluc/pl/${carId}?svd=svd-2022-07-19t00_03_33_461-18`))
                .vehicle
                .detail
                .features
            ).map(({ name }) => name);
            return requestedFeatureSets.every((reqFeatureSet) => validateFeature(reqFeatureSet, features));
        }
        return false;
    }

    async function filterTiles() {
        const tiles = document.querySelectorAll(".sc-tiles-item")
        tiles.forEach(async (t) => {
            if (await suits(t)) {
                t.style.color = "green"
            } else t.style.display = "none"
        })
    }

    const loadMoreButton = document.querySelector(".sc-load-more-btn button");
    let index = 0;
    while (document.querySelector(".sc-load-more-btn.clearfix.nm-hidden") === null && index < 6) {
        loadMoreButton.click();
        await sleep(2000);
        index++;
    }

    await filterTiles();
})();
