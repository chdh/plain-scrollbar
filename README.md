# plain-scrollbar

This package implements a plain scrollbar [web component](https://en.wikipedia.org/wiki/Web_Components) (HTML custom element).

Online demo: [www.source-code.biz/snippets/typescript/plainScrollbar](http://www.source-code.biz/snippets/typescript/plainScrollbar)<br>
NPM package: [plain-scrollbar](https://www.npmjs.com/package/plain-scrollbar)<br>
Example of how to use it: [github.com/chdh/plain-scrollbar/tree/master/example](https://github.com/chdh/plain-scrollbar/tree/master/example)

Attributes of the `PlainScrollbar` element:

* `orientation`: The orientation of the scrollbar. "horizontal" or "vertical".

Properties of the `PlainScrollbar` element:

* `value`: The current position of the thumb. A floating point number between 0 and 1.
* `thumbSize`: The size of the thumb, relative to the trough. A floating point number between 0 and 1.
* `orientation`: The orientation of the scrollbar. "horizontal" or "vertical". Same as the attribute with the same name.
* `orientationBoolean`: The orientation as a read-only boolean value. `false`=horizontal, `true`=vertical.

When the user changes the scrollbar, a `scrollbar-input` event is fired with one of the following
codes in the `detail` field:

* `value`: The user dragged the thumb of the scrollbar and the value property has been updated accordingly.
* `decrementSmall`: The user clicked on the up/left button.
* `incrementSmall`: The user clicked on the down/right button.
* `decrementLarge`: The user clicked within the upper/left background of the trough.
* `incrementLarge`: The user clicked within the lower/right background of the trough.

The following CSS variables (CSS custom properties) may be used to customize the appearance of the scrollbar.

* `plain-scrollbar-button-size`
* `plain-scrollbar-button-color`
* `plain-scrollbar-button-color-hover`
* `plain-scrollbar-button-color-active`
* `plain-scrollbar-thumb-background-color`
* `plain-scrollbar-thumb-background-color-hover`
* `plain-scrollbar-thumb-background-color-active`
* `plain-scrollbar-thumb-border-width`
* `plain-scrollbar-thumb-border-color`
* `plain-scrollbar-thumb-border-radius`
* `plain-scrollbar-thumb-min-size`
