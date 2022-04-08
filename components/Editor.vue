<template>
  <div>
    <client-only>
      <prism-editor v-model="code" class="my-editor" :highlight="highlighter" line-numbers />
    </client-only>
  </div>
</template>

<script>
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-yaml'
import 'prismjs/themes/prism-tomorrow.css' // import syntax highlighting styles

export default {
  components: {
    PrismEditor
  },
  data () {
    return {
      code: `---
 doe: "a deer, a female deer"
 ray: "a drop of golden sun"
 pi: 3.14159
 xmas: true
 french-hens: 3
 calling-birds:
   - huey
   - dewey
   - louie
   - fred
 xmas-fifth-day:
   calling-birds: four
   french-hens: 3
   golden-rings: 5
   partridges:
     count: 1
     location: "a pear tree"
   turtle-doves: two`
    }
  },
  methods: {
    highlighter (code) {
      return highlight(code, languages.yaml)
    }
  }
}
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
}

.prism-editor__textarea:focus {
  outline: none;
}
</style>
