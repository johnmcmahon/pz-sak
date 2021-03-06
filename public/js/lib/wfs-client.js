/**
 Copyright 2016, RadiantBlue Technologies, Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
/**
 * Created by sbortman on 9/28/15.
 */

//= require jquery.js
//= require OpenLayersLite-formats.js
//= require_self

'use strict';
var OGC = {WFS: {}};

OGC.WFS.Client = OpenLayers.Class({
    initialize: function ( wfsServer ){
        this.wfsServer = wfsServer;
        function getName( node, obj )
        {
            var name = this.getChildValue( node );
            if ( name )
            {
                var parts = name.split( ":" );
                obj.name = name; // parts.pop();
                if ( parts.length > 0 )
                {
                    obj.featureNS = this.lookupNamespaceURI( node, parts[0] );
                }
            }
        }

        var wfsVersions = ['v1', 'v1_0_0', 'v1_1_0', 'v2_0_0'];

        for ( var i = 0; i < wfsVersions.length; i++ )
        {
            OpenLayers.Util.extend( OpenLayers.Format.WFSCapabilities[wfsVersions[i]].prototype.readers.wfs, {
                Name: getName
            } );
        }

    },
    getFeatureTypes: function (cb){
        var localFeatureTypes = [];
        var isAsync = (cb instanceof Function);
        if ( this.wfsFeatureTypes === undefined ){
            OpenLayers.Format.WFSCapabilities.v1.prototype.readers = {
                "wfs": {
                    "WFS_Capabilities": function ( node, obj )
                    {
                        this.readChildNodes( node, obj );
                    },
                    "FeatureTypeList": function ( node, request )
                    {
                        request.featureTypeList = {
                            featureTypes: []
                        };
                        this.readChildNodes( node, request.featureTypeList );
                    },
                    "FeatureType": function ( node, featureTypeList )
                    {
                        var featureType = {};
                        this.readChildNodes( node, featureType );
                        featureTypeList.featureTypes.push( featureType );
                    },
                    "Name": function ( node, obj )
                    {
                        var name = this.getChildValue( node );
                        if ( name )
                        {
                            var parts = name.split( ":" );
                            obj.name = name; //parts.pop();
                            if ( parts.length > 0 )
                            {
                                obj.featureNS = this.lookupNamespaceURI( node, parts[0] );
                            }
                        }
                    },
                    "Title": function ( node, obj )
                    {
                        var title = this.getChildValue( node );
                        if ( title )
                        {
                            obj.title = title;
                        }
                    },
                    "Abstract": function ( node, obj )
                    {
                        var abst = this.getChildValue( node );
                        if ( abst )
                        {
                            obj["abstract"] = abst;
                        }
                    }
                }
            };

            var formatter = new OpenLayers.Format.WFSCapabilities();

            var that = this;

            var params = {
                service: 'WFS',
                version: '1.1.0',
                request: 'GetCapabilities'
            };

            var unencodedURI = "?service=WFS&version=1.1.0&request=GetCapabilities";

            OpenLayers.Request.GET( {
                url: this.wfsServer + unencodedURI,
                //params: params,
                async: isAsync,
                success: function ( request )
                {
                    var doc = request.responseXML;
                    if ( !doc || !doc.documentElement )
                    {
                        doc = request.responseText;
                    }

                    // use the tool to parse the data
                    var response = (formatter.read( doc ));

                    //console.log( 'formatter', formatter );
                    //console.log( 'namespaces', formatter.namespaces );
                    //console.log( 'namespaceAlias', formatter.namespaceAlias );

                    //console.log('response', response);

                    // this object contains all the GetCapabilities data
                    //var capability = response.capability;

                    // I want a list of names to use in my queries
                    for ( var i = 0; i < response.featureTypeList.featureTypes.length; i++ )
                    {
                        var featureType = response.featureTypeList.featureTypes[i];

                        //                    console.log( 'featureType', featureType );

                        localFeatureTypes.push( featureType );

                        //console.log(formatter.namespaceAlias);

                        //console.log('fullName', formatter.namespaceAlias[featureType.featureNS] + ':' + featureType.name)
                    }

                    //console.log( featureTypeNames );
                    //return featureTypeNames;

                }
            } );
            that.featureTypes = localFeatureTypes;

        }
        else
        {

            //console.log( 'cached...' );

        }

        if ( isAsync )
        {
            //console.log( 'We are ASync!' );
            cb( this.featureTypes );
        }
        //console.log( isAsync );

        return this.featureTypes;
    },
    getFeatureTypeSchema: function ( featureTypeName, namespace, callback ){
        var formatter2 = new OpenLayers.Format.WFSDescribeFeatureType();
        var parts = featureTypeName.split( ":" );
        var typeName = parts.pop();
        var prefix;

        if ( parts.length > 0 )
        {
            prefix = parts.pop();
        }
        else
        {
            prefix = 'ns1';
        }

        var params = {
            service: 'WFS',
            version: '1.1.0',
            request: 'DescribeFeatureType',
            typeName: prefix + ':' + typeName,
            namespace: 'xmlns(' + prefix + '=' + namespace + ')'
        };

        var isAsync = (callback instanceof Function);
        var results;

        console.log('DescribeFeatureType Params ######', params);

        var unencodedURI = "?service=" + params.service +
                            "&version=" + params.version +
                            "&request=" + params.request +
                            "&typeName=" + params.typeName +
                            "&namespace=" + params.namespace;

        OpenLayers.Request.GET( {
            url: this.wfsServer + unencodedURI,
            //params: params,
            //dataType: "html",
            async: isAsync,
            success: function ( request )
            {
                var doc = request.responseXML;
                if ( !doc || !doc.documentElement )
                {
                    doc = request.responseText;
                }

                // use the tool to parse the data
                var response = (formatter2.read( doc ));

                //console.log( 'response', response );
                results = response;
            },
            error: function ( error )
            {
                console.log( 'error', error );
            }
        } );

        return results;
    },
    getFeature: function (wfsParams, callback){

        var parts = wfsParams.typeName.split( ":" );
        var typeName = parts.pop();
        var prefix,
            isAsync,
            format;

        if(parts.length > 0){
            prefix = parts.pop();
        }
        else{
            prefix = 'ns1';
        }

        isAsync = (callback instanceof Function);

        // WFS getFeature request parameters
        var params = {
            service: 'WFS',
            version: wfsParams.version || '1.1.0',
            request: 'GetFeature', // static
            maxFeatures: wfsParams.maxFeatures || '50',
            typeName: prefix + ':' + typeName,
            outputFormat: wfsParams.outputFormat || 'GML3'
        };

        if (wfsParams.cql){
            params.filter = this.convertCqlToXml(wfsParams.cql);
        } else if (wfsParams.filter) {
            params.filter = wfsParams.filter;
        }

        if(wfsParams.namespace){
            params.namespace = 'xmlns(' + prefix + '=' + wfsParams.namespace + ')';
        }

        //console.log('params', params);

        //TODO: Convert to utility function
        switch(params.outputFormat){
            case 'GML3':
                //console.log('Requesting GML3');
                format = new OpenLayers.Format.GML.v3();
                break;
            case 'GML2':
                //console.log('Requesting GML2');
                format = new OpenLayers.Format.GML.v2();
                break;
            case 'JSON':
                //console.log('Requesting JSON');
                format = new OpenLayers.Format.JSON();
            default:
                //console.log('Default');
                break;
        }

        var unencodedURI = "?service=" + params.service +
                "&version=" + params.version +
                "&request=" + params.request +
                "&maxFeatures=" + params.maxFeatures +
                "&typeName=" + params.typeName +
                "&outputFormat=" + params.outputFormat;

        OpenLayers.Request.GET({
            url: this.wfsServer + unencodedURI,
            //params: params,
            success: function (request){
                var response = request;

                var doc = request.responseXML;

                if (!doc || !doc.documentElement ){
                    doc = request.responseText;
                }

                // use the formatter to parse the data
                var response = (format.read(doc));

                //console.log(response.features);

                if (isAsync){
                    callback(response.features);
                }
            },
            failure: function (error){
                alert(error);
            }
        } );
    },
    convertCqlToXml: function (filterCql){
        var cql = new OpenLayers.Format.CQL();
        var xml = new OpenLayers.Format.XML();
        var filterXml = xml.write( new OpenLayers.Format.Filter( {version: "1.1.0"} ).write( cql.read( filterCql ) ) );

        return filterXml;
    },
    CLASS_NAME: "OGC.WFS.Client"
} );

