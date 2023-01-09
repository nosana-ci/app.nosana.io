<template>
  <div>
    <client-only>
      <prism-editor
        ref="editor"
        v-model="code"
        :readonly="readonly"
        class="my-editor"
        :highlight="highlighter"
        line-numbers
      />
    </client-only>
  </div>
</template>

<script>
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

export default {
  components: {
    PrismEditor
  },
  props: ['value', 'readonly', 'highlight-lines'],
  data () {
    return {
    };
  },
  computed: {
    code: {
      get () {
        return this.value;
      },
      set (val) {
        this.$emit('input', val);
      }
    }
  },
  watch: {
    highlightLines: function () {
      this.highlight();
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.highlight();
    });
  },
  methods: {
    highlighter (code) {
      if (code && languages.yaml) {
        return highlight(code, languages.yaml);
      }
      return '';
    },
    highlight () {
      const lines = this.$el.querySelectorAll('.prism-editor__line-number');
      lines.forEach((element) => {
        element.classList.remove('highlight-line');
      });
      for (const highlightLine of this.highlightLines) {
        this.highlightLineNumber(highlightLine);
      }
    },
    highlightLineNumber (number) {
      const line = this.$el.querySelector(`.prism-editor__line-number:nth-child(${number + 1})`);
      if (!line) { return; }
      line.classList.add('highlight-line');
    }
  }
};
</script>

<style lang="scss">
.token.number {
    background-color: transparent;
    border-radius: 9999px;
    display: inline;
    font-size: 1em;
    height: auto;
    margin-right: 0;
    min-width: 0;
    padding: 0;
    text-align: left;
    vertical-align: unset;
}
.my-editor {
    background: $white-ter;
    font-family: $family-headers;
    // line-height: 1.5;
    font-size: 14px;
    padding: 5px;
    position: relative;
}

.prism-editor__textarea:focus {
  outline: none;
}
.prism-editor__line-number.highlight-line {
    border-left: 5px solid #f14668;
    background: rgba(241, 70, 104, 0.3);
  }

  .prism-editor__line-number.highlight-line:after {
    content: "";
    height: 24px;
    background: rgba(241, 70, 104, 0.3);
    pointer-events: none;
    position: absolute;
    z-index: 1;
    max-width: 100%;
    width: 100% !important;
  }
</style>
