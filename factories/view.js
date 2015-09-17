angular.module('HT').factory('View', function(Device) {
    return {
        largeScreenSize: function() {
            return Device.getOriginalScreenSize() === 'large';
        },

        mediumScreenSize: function() {
            return Device.getOriginalScreenSize() === 'medium';
        },

        smallOrMediumScreenSize: function() {
            return (Device.getOriginalScreenSize() === 'small') || (Device.getOriginalScreenSize() === 'medium');
        },

        largeOrMediumScreenSize: function() {
            return (Device.getOriginalScreenSize() === 'large') || (Device.getOriginalScreenSize() === 'medium');
        },

        smallScreenSize: function() {
            return Device.getOriginalScreenSize() === 'small';
        },

        isLandscape: function() {
            return Device.getOrientation() === 'landscape';
        },

        isPortrait: function() {
            return Device.getOrientation() === 'portrait';
        },

        largePortraitScreen: function() {
            return (Device.getOriginalScreenSize() === 'large') && (Device.getOrientation() === 'portrait');
        },

        largeLandscapeScreen: function() {
            return (Device.getOriginalScreenSize() === 'large') && (Device.getOrientation() === 'landscape');
        }
    };
});