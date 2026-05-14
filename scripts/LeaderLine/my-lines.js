
<script>
/**
 * Global registry and updater for all LeaderLine instances created via drawLeader.
 * Handles:
 *  - storing all lines
 *  - repositioning all lines on resize/scroll
 *  - smooth real-time repositioning during .pill transitions
 */
const LeaderLineRegistry = {
  lines: [],
  animating: false,
  _initialized: false,

  /**
   * Initialize one-time global event listeners for updating all registered lines.
   * This runs only once, automatically when the first line is registered.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Reposition all lines on window resize
    window.addEventListener('resize', () => this.positionAll());

    // Reposition all lines on scroll (capturing to catch scrolls on inner containers too)
    document.addEventListener('scroll', () => this.positionAll(), true);

    // Automatically add smooth animation loop for .pill transitions
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (this.animating) return;
        this.animating = true;

        const step = () => {
          this.positionAll();
          if (this.animating) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      pill.addEventListener('transitionend', () => {
        this.animating = false;
        this.positionAll();
      });
    });
  },

  /**
   * Register a newly created LeaderLine instance so it is tracked and updated.
   * @param {LeaderLine} line - The LeaderLine object to register
   */
  register(line) {
    this.init();
    this.lines.push(line);
  },

  /**
   * Calls .position() on every registered line to recalculate its endpoints.
   */
  positionAll() {
    this.lines.forEach(line => line.position());
  }
};

/**
 * Creates two DOM anchor elements (if not already present) inside a container
 * and draws a LeaderLine between them. Automatically registers the line
 * into the global LeaderLineRegistry so it stays in sync with layout changes.
 *
 * @param {Object} config
 * @param {string} [config.containerId='stage'] - The id of the container element
 * @param {Object} config.from - The "from" anchor element config
 * @param {string} config.from.id - DOM id of the starting element
 * @param {string} [config.from.text] - Optional text content for the element
 * @param {string} [config.from.className] - Optional CSS class
 * @param {Object} [config.from.style] - Inline style object
 * @param {Object} config.to - The "to" anchor element config (same fields as 'from')
 * @param {Object} [config.lineOptions={}] - Options passed directly to new LeaderLine()
 *
 * @returns {Promise<LeaderLine>} Resolves with the created LeaderLine instance
 */
function drawLeader(config) {
  const { containerId='stage', from, to, lineOptions={} } = config;

  return new Promise(resolve => {
    window.addEventListener('load', () => {
      const container = document.getElementById(containerId);
      const elements = { from, to };
      const createdDivs = {};

      for (const key in elements) {
        const { id, text, className, style } = elements[key];
        let el = document.getElementById(id);

        if (!el || !container.contains(el)) {
          el = document.createElement('div');
          el.id = id;
          el.textContent = text || '';
          el.className = className || 'anchor80-line';
          Object.assign(el.style, { position: 'relative', ...style });
          container.appendChild(el);
        }

        createdDivs[key] = el;
      }

      const line = new LeaderLine(createdDivs.from, createdDivs.to, lineOptions);
      LeaderLineRegistry.register(line);
      resolve(line);
    });
  });
}

</script>





