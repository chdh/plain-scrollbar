import * as PlainScrollbar from "plain-scrollbar";

function initScrollbarTest (scrollbarSelector: string, valueElementSelector: string) {
   const scrollbar = <PlainScrollbar.PlainScrollbar>document.querySelector(scrollbarSelector);
   const valueElement = document.querySelector(valueElementSelector)!;
   scrollbar.addEventListener("scrollbar-input", <EventListener>scrollbarInputEventListener);
   function scrollbarInputEventListener (event: CustomEvent) {
      // console.log("event " + event.detail);
      const pageSize = scrollbar.thumbSize / (1 - scrollbar.thumbSize);
      switch (event.detail) {
         case "incrementSmall": {
            scrollbar.value += pageSize / 5;
            break; }
         case "decrementSmall": {
            scrollbar.value -= pageSize / 5;
            break; }
         case "incrementLarge": {
            scrollbar.value += pageSize / 2;
            break; }
         case "decrementLarge": {
            scrollbar.value -= pageSize / 2;
            break; }}
      valueElement.innerHTML = scrollbar.value.toFixed(3); }}

function startup() {
   if (!("customElements" in window) || !("attachShadow" in HTMLElement.prototype)) {
      alert("Your browser does not support Custom Elements V1 or Shadow DOM V1.");
      return; }
   PlainScrollbar.registerCustomElement();
   initScrollbarTest("#scrollbar1", "#scrollbar1Value");
   initScrollbarTest("#scrollbar2", "#scrollbar2Value"); }

document.addEventListener("DOMContentLoaded", startup);
