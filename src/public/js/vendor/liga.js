/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
    'use strict';
    function supportsProperty(p) {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            i,
            div = document.createElement('div'),
            ret = p in div.style;
        if (!ret) {
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (i = 0; i < prefixes.length; i += 1) {
                ret = prefixes[i] + p in div.style;
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }
    var icons;
    if (!supportsProperty('fontFeatureSettings')) {
        icons = {
            'attention': '&#xe93e;',
            'caret-down': '&#xe930;',
            'caret-left': '&#xe931;',
            'caret-right': '&#xe932;',
            'caret-up': '&#xe933;',
            'chevron-down': '&#xe934;',
            'chevron-left': '&#xe935;',
            'chevron-right': '&#xe936;',
            'chevron-up': '&#xe937;',
            'close': '&#xe938;',
            'combat-log': '&#xe939;',
            'copy': '&#xe93a;',
            'edit': '&#xe93b;',
            'refresh-8': '&#xe93c;',
            'beacon': '&#xe906;',
            'blocked': '&#xe907;',
            'enemy-tile': '&#xe90f;',
            'fleet-tile': '&#xe910;',
            'cmd-post': '&#xe908;',
            'wreckage': '&#xe92f;',
            'unknown-territory': '&#xe92d;',
            'deploy': '&#xe90c;',
            'smart-weapon': '&#xe928;',
            'ballistic-weapon': '&#xe905;',
            'move': '&#xe91c;',
            'defend': '&#xe90b;',
            'stealth': '&#xe929;',
            'mine': '&#xe91b;',
            'refine': '&#xe925;',
            'signal-jam': '&#xe927;',
            'kinetic-barrier': '&#xe918;',
            'armour': '&#xe903;',
            'counter': '&#xe90a;',
            'adv-counter': '&#xe901;',
            'indirect': '&#xe915;',
            'planetary-shield': '&#xe922;',
            'range': '&#xe924;',
            'dmg': '&#xe90e;',
            'undiscovered-ore': '&#xe92c;',
            'ore-ready': '&#xe91e;',
            'in-progress': '&#xe913;',
            'alert': '&#xe902;',
            'info': '&#xe916;',
            'unknown': '&#xe92e;',
            'detected': '&#xe90d;',
            'success': '&#xe92b;',
            'outgoing': '&#xe91f;',
            'incoming': '&#xe914;',
            'refresh-12': '&#xe926;',
            'menu': '&#xe91a;',
            'planet': '&#xe921;',
            'raid': '&#xe923;',
            'guild': '&#xe912;',
            'member': '&#xe919;',
            'guild-directory': '&#xe911;',
            'key': '&#xe917;',
            'computer': '&#xe909;',
            'phone': '&#xe920;',
            'okay': '&#xe91d;',
            'arrow': '&#xe904;',
            'add': '&#xe900;',
            'subtract': '&#xe92a;',
          '0': 0
        };
        delete icons['0'];
        window.icomoonLiga = function (els) {
            var classes,
                el,
                i,
                innerHTML,
                key;
            els = els || document.getElementsByTagName('*');
            if (!els.length) {
                els = [els];
            }
            for (i = 0; ; i += 1) {
                el = els[i];
                if (!el) {
                    break;
                }
                classes = el.className;
                if (/icomoon-liga/.test(classes)) {
                    innerHTML = el.innerHTML;
                    if (innerHTML && innerHTML.length > 1) {
                        for (key in icons) {
                            if (icons.hasOwnProperty(key)) {
                                innerHTML = innerHTML.replace(new RegExp(key, 'g'), icons[key]);
                            }
                        }
                        el.innerHTML = innerHTML;
                    }
                }
            }
        };
        window.icomoonLiga();
    }
}());
