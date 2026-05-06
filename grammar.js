/**
 * @file Apacheconf grammar for tree-sitter
 * @author Pascal Rigaux <pascal.rigaux@univ-paris1.rf>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "apacheconf",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
