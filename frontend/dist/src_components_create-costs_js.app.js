"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([["src_components_create-costs_js"],{

/***/ "./src/components/create-costs.js":
/*!****************************************!*\
  !*** ./src/components/create-costs.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CreateCosts: () => (/* binding */ CreateCosts)\n/* harmony export */ });\n/* harmony import */ var _utils_http_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/http-utils */ \"./src/utils/http-utils.js\");\n\r\n\r\nclass CreateCosts {\r\n    url = '/categories/expense';\r\n    pageTitle = 'Создание категории расхода';\r\n\r\n    constructor(openNewRoute) {\r\n        this.openNewRoute = openNewRoute;\r\n        this.pageTitleElement = document.getElementById(\"page-title\");\r\n        this.pageTitleElement.innerText = this.pageTitle;\r\n        this.inputNameCategory = document.getElementById(\"input-name-category\");\r\n        this.buttonSave = document.getElementById(\"button-save\");\r\n        this.buttonSave.addEventListener('click', this.createCategory.bind(this));\r\n    }\r\n\r\n    validateInput() {\r\n        let isValid = true;\r\n\r\n        if (this.inputNameCategory.value.trim()) {\r\n            this.inputNameCategory.classList.remove('is-invalid');\r\n        } else {\r\n            this.inputNameCategory.classList.add('is-invalid');\r\n            isValid = false;\r\n        }\r\n        return isValid;\r\n    }\r\n\r\n    async createCategory() {\r\n        if (this.validateInput()) {\r\n            const result = await _utils_http_utils__WEBPACK_IMPORTED_MODULE_0__.HttpUtils.request(this.url, 'POST', true,\r\n                {\r\n                    title: this.inputNameCategory.value.trim()\r\n                });\r\n            if (result.error || !result.response) {\r\n                const inputErrorElement = document.getElementById(\"input-name-category-error\");\r\n                inputErrorElement.innerHTML = 'Ошибка: ' + '(' + result.message + ')';\r\n                this.inputNameCategory.classList.add('is-invalid');\r\n            } else {\r\n                this.inputNameCategory.classList.remove('is-invalid');\r\n                this.openNewRoute('/costs');\r\n            }\r\n        }\r\n    }\r\n}\n\n//# sourceURL=webpack://frontend/./src/components/create-costs.js?\n}");

/***/ })

}]);