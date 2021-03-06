/**
 * Copyright (C) 2020 RadixIot. All rights reserved.
 * @author Luis Güette
 */

siteFactory.$inject = ['maRestResource', '$http'];
function siteFactory(RestResource, $http) {
    'use strict';

    const JSON_STORE_XID = 'example-sites';

    class Site extends RestResource {
        static get defaultProperties() {
            return {};
        }

        static get baseUrl() {
            return `/rest/latest/json/data/${JSON_STORE_XID}`;
        }

        static get webSocketUrl() {
            return '';
        }

        static get xidPrefix() {
            return 'ATC_ASSET_';
        }

        static http(httpConfig, opts = {}) {
            const {resourceMethod, saveType, originalId} = opts.resourceInfo || {};

            // override urls and methods
            switch (resourceMethod) {
                case 'query':
                    httpConfig.url = `/rest/latest/json/query/${JSON_STORE_XID}`;
                    break;
                case 'save':
                    httpConfig.method = 'POST';
                    httpConfig.url = `${this.baseUrl}/${this.encodeUriSegment(httpConfig.data.xid)}`;
                    break;
            }

            return super.http(httpConfig, opts).finally(result => {
                // delete old xid when updating to new xid
                if (resourceMethod === 'save' && saveType === 'update' && httpConfig.data.xid !== originalId) {
                    return this.http({
                        method: 'DELETE',
                        url: `${this.baseUrl}/${this.encodeUriSegment(originalId)}`
                    }).then(r => null, e => null);
                }
            });
        }
    }

    return Site;
}

export default siteFactory;
