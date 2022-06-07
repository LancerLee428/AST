# AST

抽象语法树实现（miniVue 准备）

AST Tree 的作用

1. IDE 的错误提示、代码格式化、代码高亮、代码自动补全等
2. JSLint、JSHint 对代码错误或风格的检查等
3. webpack、rollup 进行代码打包等
4. CoffeeScript、TypeScript、JSX 等转化为原生 Javascript
5. vue 模板编译、react 模板编译

本文的目标是把

```html
<div data-type="dataType" class="test">我是一个div</div>
```

转换为

```json
{
  "node": "root",
  "child": [
    {
      "node": "element",
      "tag": "div",
      "class": "test",
      "dataset": {
        "type": "dataType"
      },
      "attrs": [],
      "child": [
        {
          "node": "text",
          "text": "我是一个div"
        }
      ]
    }
  ]
}
```
