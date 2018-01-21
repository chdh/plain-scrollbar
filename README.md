# plain-scrollbar

This package implements a plain scrollbar [web component](https://en.wikipedia.org/wiki/Web_Components) (HTML custom element).

Online demo: [www.source-code.biz/snippets/typescript/plainScrollbar](http://www.source-code.biz/snippets/typescript/plainScrollbar)<br>
NPM package: [function-curve-editor](https://www.npmjs.com/package/plain-scrollbar)<br>
Example of how to use it: [github.com/chdh/plain-scrollbar/tree/master/example](https://github.com/chdh/plain-scrollbar/tree/master/example)

The `value` property of the `PlainScrollbar` component contains the position of the scrollbar as a floating point number between 0 and 1.

When the user changes the scrollbar, a `scrollbar-input` event is fired with one of the follwing
codes in the `detail` field:

* `value`: The user dragged the thumb of the scrollbar and the value property has been updated accordingly.
* `decrementSmall`: The user clicked on the up/left button.
* `incrementSmall`: The user clicked on the down/right button.
* `decrementLarge`: The user clicked within the upper/left background of the trough.
* `incrementLarge`: The user clicked within the lower/right background of the trough.
