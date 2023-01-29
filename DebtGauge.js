class DebtGauge extends HTMLElement {
  static get observedAttributes() {
    return [
      'balance',
      'credit',
      'padding'
    ]
  }
  constructor() {
    super()
    this.shadow = this.attachShadow({
      mode: 'closed'
    })
    this.zero = 0
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);
    this.callOnce(this.render)
  }
  handleResize() {
    this.callOnce(this.render)
  }
  connectedCallback() {
    super.connectedCallback && super.connectedCallback()
    window.addEventListener('resize', this.handleResize)
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize)
    super.disconnectedCallback && super.disconnectedCallback()
  }
  callOnce(func, within = 300, timerId = null) {
    this.callOnceTimers = this.callOnceTimers || {}
    if (timerId === null) {
      timerId = func
    }
    let timer = this.callOnceTimers[timerId]
    timer = setTimeout(() => func(), within)
    this.callOnceTimers[timerId] = timer
  }
  attributeChangedCallback(_, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.callOnce(this.render)
    }
  }
  render() {
    this.fifth = (this.parentElement.clientWidth - (this.padding * 2)) / 5
    this.oneHundredPercent = this.fifth * 3
    this.shadow.innerHTML = `${this.style}${this.html}`
  }
  get style() {
    return `
        <style>
          :host {
            --padding: ${this.padding}px;
            --background-color: transparent;
            --background-color-light: #D9D9D9;
            --color: #454749;
            --zero-left: ${this.getZeroLeft()}px;
            --max-left: ${this.getMaxLeft()}px;
            --actual-left: ${this.getActualLeft()}px;
            --credit: ${this.credit};
          }
          .gauge {
            padding: 
              calc(var(--padding) * 1.5)
              var(--padding)
              calc(var(--padding) * 2)
              var(--padding);
            width: 100%;
            background-color: var(--background-color);
            position: relative;
          }
          .tick {
            position: absolute;
            width: 2px;
            height: 11px;
            top: calc((var(--padding) * 1.5) - 2px);
            background-color: var(--color);
          }
          .range {
            height: 5px;
            width: calc(100% - (var(--padding) * 2));
            background-color: var(--background-color-light);
            border: 1px solid var(--color);
          }
          .zero {
            left: var(--zero-left);
          }
          .zero::before {
            position: absolute;
            text-align: center;
            content: attr(data-zero);
            
            color: var(--color);
            top: 11px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
          }
          .max {
            left: var(--max-left);
          }
          .max:before {
            position: absolute;
            text-align: center;
            content: attr(data-credit);
            color: var(--color);
            top: -22px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
          }
          .actualTick {
            left: var(--actual-left);
          }
          .actualTick:before {
            position: absolute;
            text-align: center;
            content: attr(data-balance);
            color: var(--color);
            top: 28px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            font-weight: bold;
          }
          .actual {
            position: absolute;
            top: calc(var(--padding) * 1.5);
            height: 5px;
            border: 1px solid var(--color);
            border-bottom: 1px solid var(--color);
            left: var(--actual-left);
            width: var(--actual-width);
            background-color: var(--actual-background-color);
          }
          .tooltip {
            cursor: pointer;
          }
          .tooltip .tooltiptext {
            visibility: hidden;
            width: 120px;
            background-color: black;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px;
          
            /* Position the tooltip */
            position: absolute;
            z-index: 1;
            width: 140px;
            bottom: 100%;
            left: 50%;
            margin-left: -70px;
          }
          
          .tooltip:hover .tooltiptext {
            visibility: visible;
          }
        </style>    
      `
  }
  get html() {
    return `
        <div class="gauge">
          <div class="range"></div>
          <div class="actual"
               style="${this.getActualStyle()}"></div>
          <div class="actualTick tick tooltip"
               data-balance="${this.balance.toLocaleString('en-UK', { style: 'currency', currency: 'GBP' })}">
            <span class="tooltiptext">${this.getBalance()}</span>
          </div>
          <div class="zero tick"
               data-zero="${this.zero.toLocaleString('en-UK', { style: 'currency', currency: 'GBP' })}"></div>
          <div class="max tick tooltip"
               data-credit="${this.credit.toLocaleString('en-UK', { style: 'currency', currency: 'GBP' })}">
            <span class="tooltiptext">${this.getCredit()}</span>
          </div>
        </div>
     `
  }

  getBalance() {
    return this.balance === 0
      ? 'Nothing owed'
      : this.balance < 0
        ? `Currently ${Math.abs(this.balance).toLocaleString('en-UK', { style: 'currency', currency: 'GBP' })} in credit`
        : `Currently ${Math.abs(this.balance).toLocaleString('en-UK', { style: 'currency', currency: 'GBP' })} in debt`
  }
  getCredit() {
    return this.credit === 0
      ? 'No credit limit specified'
      : `Credit limit of ${this.credit.toLocaleString('en-UK', { style: 'currency', currency: 'GBP' })}`
  }

  getZeroLeft() {
    if (this.balance >= 0 && this.balance <= this.credit || this.balance > this.credit) {
      return this.fifth
    } else {
      return (this.oneHundredPercent * (Math.abs(this.balance) / (Math.abs(this.balance) + this.credit))) + this.fifth
    }
  }
  getMaxLeft() {
    if (this.balance === 0 && this.credit === 0) {
      return this.fifth
    } else {
      if (this.balance >= 0 && this.balance <= this.credit || this.balance < 0) {
        return this.fifth * 4
      } else {
        return this.fifth + (this.oneHundredPercent * (this.credit / this.balance))
      }
    }
  }
  getActualLeft() {
    if (this.balance === 0 && this.credit === 0) {
      return this.fifth
    }
    if (this.balance >= 0 && this.balance <= this.credit) {
      return this.fifth + (this.oneHundredPercent * (this.balance / this.credit))
    }
    if (this.balance < 0) {
      return this.fifth
    }
    if (this.balance > this.credit) {
      return this.fifth * 4
    }
  }
  getActualStyle() {
    if (this.balance < 0) {
      return `
          --actual-left: ${this.fifth}px;
          --actual-width: ${this.oneHundredPercent * (Math.abs(this.balance) / (Math.abs(this.balance) + this.credit))}px;
          --actual-background-color: ${'#33FF00'};
        `
    } else {
      if (this.balance === 0 && this.credit === 0) {
        return `
          --actual-left: ${this.fifth}px;
          --actual-width: 0px;
        `
      } else {
        if (this.balance >= 0 && this.balance <= this.credit) {
          return `
              --actual-left: ${this.fifth}px;
              --actual-width: ${this.oneHundredPercent * (this.balance / this.credit)}px;
              --actual-background-color: ${(this.balance / this.credit) <= 0.8 ? '#FF9900' : '#FF0000'};
            `
        } else {
          return `
            --actual-left: ${this.fifth}px;
            --actual-width: ${this.oneHundredPercent}px;
            --actual-background-color: ${'#FF0000'};
          `
        }
      }
    }
  }
  get balance() {
    return this.hasAttribute('balance') ? Number(this.getAttribute('balance')) : 0
  }
  get credit() {
    return this.hasAttribute('credit') ? Number(this.getAttribute('credit')) : 0
  }
  get padding() {
    return this.hasAttribute('padding') ? Number(this.getAttribute('padding')) : 20
  }
}
window.customElements.define('wc-debt-gauge', DebtGauge)
