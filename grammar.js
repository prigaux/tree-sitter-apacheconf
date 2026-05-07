/**
 * @file Apacheconf grammar for tree-sitter
 * @author Pascal Rigaux <pascal.rigaux@univ-paris1.rf>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "apacheconf",
  extras: $ => [
    /[ \t]/,
  ],

  rules: {
    source_file: $ => repeat($._directives),
    
    comment: $ => /#.*\n/,
       
    _directives: $ => choice(
      $.comment,
      $._end_of_line,
      $.simple_directive,
      $.tag_directive,
    ),


    /// Simple directive /////////////////////////////////////
    
    simple_directive: $ => seq(
      field('name', $._simple_directive_name),
      repeat($.simple_param),
      $._end_of_line,
    ),

    _simple_directive_name: $ => choice(
      $.non_quoted_simple_directive_name,
      $.string, // no-one uses this, but it IS allowed
    ),
    non_quoted_simple_directive_name: $ => /[^"'\s<#\\](\\\n|[^\s\\])*/,
    
    simple_param: $ => choice(
      $.non_string_param,
      $.string, 
      $.line_continuation, 
    ),
    non_string_param: $ => /[^"'\s][^\\\s]*/,
    

    /// Tag directive /////////////////////////////////////

    tag_directive: $ => seq(
      '<',
        field('name', $.tag_name),
        $._optional_spaces, // needed since tag_name does not allow spaces
        repeat($.tag_param), 
        repeat(seq(alias('>', $.tag_param), $._optional_spaces)),
      '>', $._optional_spaces,
      $._end_of_line,
      
      repeat($._directives),
      
      '</',
        field('end_name', $.tag_name),
        $._optional_spaces, // needed since tag_name does not allow spaces
      '>',
      $._end_of_line,
    ),

    // simplification: do not allow trailing ">" or "\" whereas ApacheConf allows it
    tag_name: $ => token.immediate(/[^>\s\\]([^>\s\\]|[\\>][^>\s\\])*/),

    _optional_spaces: $ => /[ \t]*/,

    tag_param: $ => choice(
      $.string, 
      $.non_string_tag_param,
      $.line_continuation,
    ),
    // trailing ">"/"\" are handled specifically to handle ambiguitee
    non_string_tag_param: $ => /([>\\]|[^"'">\s\\])([^>\s\\]|[>\\][^>\s\\])*/,
    
    

    // Shared simple tokens ////////////////////////////////
    _end_of_line: $ => /\r?\n/,
    line_continuation: $ => /[\\]\r?\n/,
    
    ////////////////////////////////////////
    // Quoted String Parsing Begins
    ////////////////////////////////////////
    string: $ => choice(
      seq(
        "'",
        repeat(
          choice(
            $.singlequote_string_content,
            $.line_continuation,
            `\\'`,
            `\\`,
          )
        ),
        "'",
      ),
      seq(
        '"',
        repeat(
          choice(
            $.doublequote_string_content,
            $.line_continuation,
            `\\"`,
            `\\`,
          )
        ),
        '"',
      ),
    ),    
    singlequote_string_content: $ => /[^\'\r\n\\]+/,
    doublequote_string_content: $ => /[^\"\r\n\\]+/,
  }
});
