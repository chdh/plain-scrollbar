class Widget {

   private host:             HTMLElement;
   private root:             HTMLElement;
   private trough:           HTMLElement;
   private button1:          HTMLElement;
   private button2:          HTMLElement;
   private thumb:            HTMLElement;
   private isConnected:      boolean;

   public  thumbSize:        number = 0.3;                 // relative thumb size (0..1)
   public  value:            number = 0;                   // current scrollbar position (0..1)
   public  orientation:      boolean = false;              // false=horizontal, true=vertical
   private clickRepeatDelay:    number = 300;              // click repetition delay time in ms
   private clickRepeatInterval: number = 100;              // click repetition interval time in ms

   private dragStartPos:     number;                       // dragging start mouse position (clientX/Y)
   private dragStartValue:   number;                       // dragging start scrollbar position
   private eventTimeoutId:   number | undefined;

   // User interaction state:
   private thumbDragging:    boolean;                      // true while user is dragging the thumb
   private button1Active:    boolean;                      // true while user has mouse clicked down on button 1
   private button2Active:    boolean;                      // true while user has mouse clicked down on button 2
   private troughActive:     boolean;                      // true while user has mouse clicked down on trough

   constructor (host: HTMLElement) {
      this.host = host;
      host.attachShadow({mode: "open"});
      const shadowRoot = host.shadowRoot!;
      shadowRoot.innerHTML = scrollbarHtmlTemplate;
      this.root    = <HTMLElement>shadowRoot.querySelector("#root")!;
      this.trough  = <HTMLElement>shadowRoot.querySelector("#trough")!;
      this.button1 = <HTMLElement>shadowRoot.querySelector("#button1")!;
      this.button2 = <HTMLElement>shadowRoot.querySelector("#button2")!;
      this.thumb   = <HTMLElement>shadowRoot.querySelector("#thumb")!;
      this.trough.addEventListener("mousedown", (event: MouseEvent) => this.onTroughMouseDown(event));
      this.button1.addEventListener("mousedown", (event: MouseEvent) => this.onButtonMouseDown(event, 1));
      this.button2.addEventListener("mousedown", (event: MouseEvent) => this.onButtonMouseDown(event, 2));
      this.thumb.addEventListener("mousedown", (event: MouseEvent) => this.onThumbMouseDown(event));
      this.resetInteractionState(); }

   private resetInteractionState() {
      this.thumbDragging = false;
      this.button1Active = false;
      this.button2Active = false;
      this.troughActive = false; }

   public connectedCallback() {
      this.isConnected = true;
      this.resetInteractionState();
      this.updateLayout();
      this.updateStyle(); }

   public disconnectedCallback() {
      this.isConnected = false;
      this.stopEventRepetition();
      this.removeDocumentMouseEventListeners(); }

   public updateLayout() {
      if (!this.isConnected) {
         return; }
      this.root.classList.toggle("horizontal", !this.orientation);
      this.root.classList.toggle("vertical", this.orientation);
      this.thumb.style.height = this.orientation ? percent(this.thumbSize) : "";
      this.thumb.style.width  = this.orientation ? "": percent(this.thumbSize);
      this.thumb.style.top = "";
      this.thumb.style.left = "";
      this.updateThumbPosition(); }

   private updateStyle() {
      if (!this.isConnected) {
         return; }
      this.thumb.classList.toggle("active", this.thumbDragging);
      this.button1.classList.toggle("active", this.button1Active);
      this.button2.classList.toggle("active", this.button2Active); }

   public updateThumbPosition() {
      const v = (1 - this.thumbSize) * this.value;
      if (this.orientation) {
         this.thumb.style.top = percent(v); }
       else {
         this.thumb.style.left = percent(v); }}

   private computeThumbMoveValue (distancePixels: number) : number {
      const r = this.trough.getBoundingClientRect();
      const troughSizePixels = this.orientation ? r.height : r.width;
      const troughSlidePixels = troughSizePixels * (1 - this.thumbSize);
      if (troughSlidePixels < EPS) {
         return 0; }
      return distancePixels / troughSlidePixels; }

   public setThumbSize (newThumbSize: number) {
      const clippedNewThumbSize = Math.max(0, Math.min(1, newThumbSize));
      if (clippedNewThumbSize == this.thumbSize) {
         return; }
      this.thumbSize = clippedNewThumbSize;
      this.updateLayout(); }

   public setValue (newValue: number) : boolean {
      const clippedNewValue = Math.max(0, Math.min(1, newValue));
      if (clippedNewValue == this.value) {
         return false; }
      this.value = clippedNewValue;
      this.updateThumbPosition();
      return true; }

   public setOrientation (newOrientation: boolean) : boolean {
      if (newOrientation == this.orientation) {
         return false; }
      this.orientation = newOrientation;
      this.updateLayout();
      return true; }

   //--- Events ----------------------------------------------------------------

   private fireEvent (eventSubType: string) {
      const event = new CustomEvent("scrollbar-input", { detail: eventSubType });
      this.host.dispatchEvent(event); }

   private fireEventRepeatedly (eventSubType: string, repeatDelay: number, repeatInterval: number, repeatCounter = 0) {
      this.stopEventRepetition();
      this.fireEvent(eventSubType);
      const delay = (repeatCounter == 0) ? repeatDelay : repeatInterval;
      const f = () => this.fireEventRepeatedly(eventSubType, repeatDelay, repeatInterval, repeatCounter + 1);
      this.eventTimeoutId = setTimeout(f, delay); }

   private stopEventRepetition() {
      if (this.eventTimeoutId) {
        clearTimeout(this.eventTimeoutId);
        this.eventTimeoutId = undefined; }}

   //--- Mouse input -----------------------------------------------------------

   private onTroughMouseDown (event: MouseEvent) {
      if (event.which != 1) {
         return; }
      const r = this.trough.getBoundingClientRect();
      const pos = this.orientation ? event.clientY - r.top : event.clientX - r.left;
      const threshold = (this.orientation ? r.height : r.width) * (1 - this.thumbSize) * this.value;
      const direction = pos > threshold;
      const eventSubType = direction ? "incrementLarge" : "decrementLarge";
      this.troughActive = true;
      this.fireEventRepeatedly(eventSubType, this.clickRepeatDelay, this.clickRepeatInterval);
      this.addDocumentMouseEventListeners();
      event.preventDefault();
      event.stopPropagation(); }

   private onButtonMouseDown (event: MouseEvent, buttonNo: number) {
      if (event.which != 1) {
         return; }
      switch (buttonNo) {
         case 1: this.button1Active = true; break;
         case 2: this.button2Active = true; break; }
      const eventSubType = (buttonNo == 1) ? "decrementSmall" : "incrementSmall";
      this.fireEventRepeatedly(eventSubType, this.clickRepeatDelay, this.clickRepeatInterval);
      this.addDocumentMouseEventListeners();
      this.updateStyle();
      event.preventDefault();
      event.stopPropagation(); }

   private onThumbMouseDown (event: MouseEvent) {
      if (event.which != 1) {
         return; }
      this.dragStartPos = this.orientation ? event.clientY : event.clientX;
      this.dragStartValue = this.value;
      this.thumbDragging = true;
      this.addDocumentMouseEventListeners();
      this.updateStyle();
      event.preventDefault();
      event.stopPropagation(); }

   private addDocumentMouseEventListeners() {
      if (!this.isConnected) {
         return; }
      document.addEventListener("mousemove", this.onDocumentMouseMove);
      document.addEventListener("mouseup",   this.onDocumentMouseUp); }

   private removeDocumentMouseEventListeners() {
      document.removeEventListener("mousemove", this.onDocumentMouseMove);
      document.removeEventListener("mouseup",   this.onDocumentMouseUp); }

   private onDocumentMouseMove = (event: MouseEvent) => {
      if (this.thumbDragging) {
         const pos = this.orientation ? event.clientY : event.clientX;
         const deltaPixels = pos - this.dragStartPos;
         const deltaValue = this.computeThumbMoveValue(deltaPixels);
         const newValue = this.dragStartValue + deltaValue;
         if (this.setValue(newValue)) {
            this.fireEvent("value"); }
         event.preventDefault();
         event.stopPropagation(); }};

   private onDocumentMouseUp = (event: MouseEvent) => {
      if (this.thumbDragging) {
         this.thumbDragging = false;
         this.updateStyle();
         event.preventDefault();
         event.stopPropagation(); }
      if (this.button1Active || this.button2Active || this.troughActive) {
         this.button1Active = false;
         this.button2Active = false;
         this.troughActive = false;
         this.updateStyle();
         this.stopEventRepetition();
         event.preventDefault();
         event.stopPropagation(); }
      this.removeDocumentMouseEventListeners(); };

   } // end class

//--- Custom Element -----------------------------------------------------------

export class PlainScrollbar extends HTMLElement {

   private widget:           Widget;

   constructor() {
      super();
      this.widget = new Widget(this); }

   /* @Override */ public connectedCallback() {
      this.widget.connectedCallback(); }

   /* @Override */ public disconnectedCallback() {
      this.widget.disconnectedCallback(); }

   //--- Element properties ----------------------------------------------------

   // Size of the thumb, relative to the trough.
   // A value between 0 and 1.
   public get thumbSize() : number {
      return this.widget.thumbSize; }
   public set thumbSize (v: number) {
      this.widget.setThumbSize(v); }

   // The current position of the scrollbar.
   // A value between 0 and 1.
   public get value() : number {
      return this.widget.value; }
   public set value (v: number) {
      this.widget.setValue(v); }

   // Orientation of the scrollbar.
   // "horizontal" or "vertical".
   public get orientation() : string {
      return formatOrientation(this.widget.orientation); }
   public set orientation (s: string) {
      if (this.widget.setOrientation(decodeOrientation(s))) {
         this.setAttribute("orientation", this.orientation); }}

   // Returns false=horizontal, true=vertical.
   public get orientationBoolean() : boolean {
      return this.widget.orientation; }

   //--- Element attributes ----------------------------------------------------

   /* @Override */ public static get observedAttributes() {
        return ["orientation"]; }

   /* @Override */ public attributeChangedCallback (attrName: string, _oldValue: string|null, newValue: string|null) {
      switch (attrName) {
         case "orientation": {
            if (newValue) {
               this.widget.setOrientation(decodeOrientation(newValue)); }
            break; }}}

   } // end class

//------------------------------------------------------------------------------

const EPS        = 1E-9;
const buttonSize = "var(--plain-scrollbar-button-size, 13px)";
const buttonPath = '<path d="M -60 30 h 120 L 0 -30 z" stroke-width="0"/>';

const scrollbarStyle = `
   :host {
      display: block;
      contain: content;
      background-color: #f8f8f8;
      border-style: solid;
      border-width: 1px;
      border-color: #dddddd;
   }
   #root {
      box-sizing: border-box;
      position: relative;
      width: 100%;
      height: 100%;
   }
   #trough {
      position: absolute;
   }
   #root.vertical #trough {
      width: 100%;
      top: ${buttonSize};
      bottom: ${buttonSize};
   }
   #root.horizontal #trough {
      height: 100%;
      left: ${buttonSize};
      right: ${buttonSize};
   }
   #thumb {
      box-sizing: border-box;
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: var(--plain-scrollbar-thumb-background-color, #f0f0f0);
      border-style: solid;
      border-width: var(--plain-scrollbar-thumb-border-width, 1px);
      border-color: var(--plain-scrollbar-thumb-border-color, #b8b8b8);
      border-radius: var(--plain-scrollbar-thumb-border-radius, 4px);
      transition: background-color 50ms linear;
   }
   #thumb:hover {
      background-color: var(--plain-scrollbar-thumb-background-color-hover, #e0e0e0);
   }
   #thumb.active {
      background-color: var(--plain-scrollbar-thumb-background-color-active, #c0c0c0);
   }
   #button1,
   #button2 {
      box-sizing: border-box;
      position: absolute;
      display: block;
      fill: var(--plain-scrollbar-button-color, #606060);
   }
   #root.vertical #button1 {
      top: 0;
      width: 100%;
      height: ${buttonSize};
   }
   #root.vertical #button2 {
      bottom: 0;
      width: 100%;
      height: ${buttonSize};
   }
   #root.horizontal #button1 {
      left: 0;
      height: 100%;
      width: ${buttonSize};
   }
   #root.horizontal #button2 {
      right: 0;
      height: 100%;
      width: ${buttonSize};
   }
   #upArrow,
   #downArrow,
   #leftArrow,
   #rightArrow {
      display: none;
      width: 100%;
      height: 100%;
   }
   #root.vertical #upArrow,
   #root.vertical #downArrow {
      display: block;
   }
   #root.horizontal #leftArrow,
   #root.horizontal #rightArrow {
      display: block;
   }
   #button1:hover,
   #button2:hover {
      background-color: var(--plain-scrollbar-button-color-hover, #e0e0e0);
   }
   #button1.active,
   #button2.active {
      background-color: var(--plain-scrollbar-button-color-active, #c0c0c0);
   }
   `;

const scrollbarHtmlTemplate = `
   <style>${scrollbarStyle}</style>
   <div id="root">
    <div id="button1">
     <svg id="upArrow" viewBox="-100 -100 200 200">${buttonPath}</svg>
     <svg id="leftArrow" viewBox="-100 -100 200 200"><g transform="rotate(-90)">${buttonPath}</g></svg>
    </div>
    <div id="trough">
     <div id="thumb"></div>
    </div>
    <div id="button2">
     <svg id="downArrow" viewBox="-100 -100 200 200"><g transform="rotate(180)">${buttonPath}</g></svg>
     <svg id="rightArrow" viewBox="-100 -100 200 200"><g transform="rotate(90)">${buttonPath}</g></svg>
    </div>
   </div>
   `;

//------------------------------------------------------------------------------

function formatOrientation (b: boolean) : string {
   return b ? "vertical" : "horizontal"; }

function decodeOrientation (s: string) : boolean {
   switch (s) {
      case "vertical":   return true;
      case "horizontal": return false;
      default:           throw new Error("Invalid orientation value \"" + s + "\"."); }}

function percent (v: number) {
   return (v * 100).toFixed(3) + "%"; }

export function registerCustomElement() {
   customElements.define("plain-scrollbar", PlainScrollbar); }
