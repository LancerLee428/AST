/**
 * 将html转AST
 * let html = '<div data-type='dataType' class='test'>我是一个div</div>';
 */
const html2AST = (html) => {
  // 起始标签 相当于<div>
  const startTag =
    /<([a-zA-Z_][\w\-\.]*)((?:\s+([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))*)\s*(\/?)>/;
  // 结束标签 相当于</div>
  const endTag = /<\/([a-zA-Z_][\w\-\.]*)>/;
  // 标签类名 class
  const attr =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

  // 用来存储未处理完的起始标签
  const bufferArray = [];
  // AST Node
  const res = {
    node: "root",
    child: [],
  };

  let chars = false;
  let match;
  let last;

  while (html && last != html) {
    last = html;
    chars = true;
    /**
     * 已 </ 开头，且能匹配上实时截止标签的正则，则该 html 字符串内容要向后移动匹配到的长度，继续匹配剩下的。
     * 这里使用了replace方法，parseEndTag的参数就是"()"匹配的输出结果了，已经匹配到的字符再 parseEndTag 处理标签。
     */
    if (html.indexOf("</") == 0) {
      match = html.match(endTag);
      if (match) {
        chars = false;
        html = html.substring(match[0].length);
        // 调函数地址指针，让js把目标tag传进去
        match[0].replace(endTag, parseEndTag);
      }
    } else if (html.indexOf("<") == 0) {
      match = html.match(startTag);
      if (match) {
        chars = false;
        html = html.substring(match[0].length);
        match[0].replace(startTag, parseStartTag);
      }
    }
    // 未匹配到<或</，一律按文本内容处理
    if (chars) {
      let index = html.indexOf("<");
      let text;
      if (index < 0) {
        text = html;
        html = "";
      } else {
        text = html.substring(0, index);
        html = html.substring(index);
      }
      const node = {
        node: "text",
        text,
      };
      pushChild(node);
    }
  }
  /**
   * 没有bufferArray说明当前Node为新Node，则推入栈中
   * 有bufferArray说明没有处理完，存在嵌套标签
   * 取最后一位（也就是最近未匹配）的标签作为新的起始节点
   */
  function pushChild(node) {
    if (bufferArray.length === 0) {
      res.child.push(node);
    } else {
      const parent = bufferArray[bufferArray.length - 1];
      if (typeof parent.child == "undefined") {
        parent.child = [];
      }
      parent.child.push(node);
    }
  }
  function parseStartTag(tag, tagName, rest) {
    tagName = tagName.toLowerCase();

    const ds = {};
    const attrs = [];
    let unary = !!arguments[7];

    const node = {
      node: "element",
      tag: tagName,
    };
    rest.replace(attr, function (match, name) {
      const value = arguments[2]
        ? arguments[2]
        : arguments[3]
        ? arguments[3]
        : arguments[4]
        ? arguments[4]
        : "";
      if (name && name.indexOf("data-") == 0) {
        ds[name.replace("data-", "")] = value;
      } else {
        if (name == "class") {
          node.class = value;
        } else {
          attrs.push({
            name,
            value,
          });
        }
      }
    });
    node.dataset = ds;
    node.attrs = attrs;
    if (!unary) {
      bufferArray.push(node);
    } else {
      pushChild(node);
    }
    console.log(arguments, "--------parseStart");
    console.log(tag, "------tag");
  }
  function parseEndTag(tag, tagName) {
    let pos = 0;
    for (pos = bufferArray.length - 1; pos >= 0; pos--) {
      if (bufferArray[pos].tag == tagName) {
        break;
      }
    }
    if (pos >= 0) {
      pushChild(bufferArray.pop());
    }
  }
  return res;
};
const ast = html2AST("<div data-type='dataType' class='test'>我是一个div</div>");

console.log(ast);
