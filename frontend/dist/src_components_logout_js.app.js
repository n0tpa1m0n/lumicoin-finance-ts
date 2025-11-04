"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([["src_components_logout_js"],{

/***/ "./src/components/logout.js":
/*!**********************************!*\
  !*** ./src/components/logout.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Logout: () => (/* binding */ Logout)\n/* harmony export */ });\n/* harmony import */ var _utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/auth-utils */ \"./src/utils/auth-utils.js\");\n/* harmony import */ var _utils_http_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/http-utils */ \"./src/utils/http-utils.js\");\n\r\n\r\n\r\nclass Logout {\r\n    constructor(openNewRoute) {\r\n        this.openNewRoute = openNewRoute;\r\n\r\n        if (!_utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.getAuthInfo(_utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.accessTokenKey) || !_utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.getAuthInfo(_utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.refreshTokenKey)) {\r\n            return this.openNewRoute('/login');\r\n        }\r\n\r\n        this.logout().then();\r\n\r\n    }\r\n\r\n    async logout() {\r\n        await _utils_http_utils__WEBPACK_IMPORTED_MODULE_1__.HttpUtils.request('/logout', 'POST', 'false', {\r\n            refreshToken: _utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.getAuthInfo(_utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.refreshTokenKey)\r\n        });\r\n\r\n        _utils_auth_utils__WEBPACK_IMPORTED_MODULE_0__.AuthUtils.removeAuthInfo();\r\n        this.openNewRoute('/login');\r\n    }\r\n\r\n}\n\n//# sourceURL=webpack://frontend/./src/components/logout.js?\n}");

/***/ }),

/***/ "./src/utils/http-utils.js":
/*!*********************************!*\
  !*** ./src/utils/http-utils.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   HttpUtils: () => (/* binding */ HttpUtils)\n/* harmony export */ });\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ \"./src/utils/config.js\");\n/* harmony import */ var _auth_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./auth-utils */ \"./src/utils/auth-utils.js\");\n\r\n\r\n\r\nclass HttpUtils {\r\n    static async request(url, method = 'GET', useAuth = true, body = null) {\r\n        const result = {\r\n            error: false,\r\n            response: null\r\n        }\r\n\r\n        const accessToken = _auth_utils__WEBPACK_IMPORTED_MODULE_1__.AuthUtils.getAuthInfo(_auth_utils__WEBPACK_IMPORTED_MODULE_1__.AuthUtils.accessTokenKey);\r\n        const refreshToken = _auth_utils__WEBPACK_IMPORTED_MODULE_1__.AuthUtils.getAuthInfo(_auth_utils__WEBPACK_IMPORTED_MODULE_1__.AuthUtils.refreshTokenKey);\r\n\r\n        const params = {\r\n            method: method,\r\n            headers: {\r\n                'Content-type': 'application/json',\r\n                'Accept': 'application/json',\r\n            },\r\n        };\r\n\r\n        if (useAuth) {\r\n            if (accessToken) {\r\n                params.headers['x-auth-token'] = accessToken;\r\n            } else {\r\n                console.log('No access token - request may fail');\r\n            }\r\n        }\r\n\r\n        if (body) {\r\n            params.body = JSON.stringify(body);\r\n        }\r\n\r\n        let response = null;\r\n        try {\r\n            response = await fetch(_config__WEBPACK_IMPORTED_MODULE_0__.config.api + url, params);\r\n\r\n            result.response = await response.json();\r\n\r\n        } catch (e) {\r\n            result.error = true;\r\n            return result;\r\n        }\r\n\r\n        if (response.status < 200 || response.status >= 300) {\r\n            result.error = true;\r\n\r\n            if (useAuth && response.status === 401) {\r\n                if (!accessToken) {\r\n                    result.redirect = '/login';\r\n                } else {\r\n                    const updateTokenResult = await _auth_utils__WEBPACK_IMPORTED_MODULE_1__.AuthUtils.updateRefreshToken();\r\n                    if (updateTokenResult) {\r\n                        return this.request(url, method, useAuth, body);\r\n                    } else {\r\n                        result.redirect = '/login';\r\n                    }\r\n                }\r\n            }\r\n        }\r\n\r\n        return result;\r\n    }\r\n}\n\n//# sourceURL=webpack://frontend/./src/utils/http-utils.js?\n}");

/***/ })

}]);