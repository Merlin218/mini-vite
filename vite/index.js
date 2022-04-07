const Koa = require('koa');

const app = new Koa();
const fs = require('fs');
const path = require('path');
const { reWriteImport } = require('./utils');
const compilerSFC = require('@vue/compiler-sfc');
const compilerDOM = require('@vue/compiler-dom');

app.use(async (ctx) => {
  const { url,query } = ctx.request;
  if (url === '/') {
    // 加载index.html文件
    ctx.type = 'text/html';
    ctx.body = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8');
  } else if (url.endsWith('.js')) {
    // 加载js文件
    const p = path.join(__dirname, url);
    ctx.type = 'application/javascript';
    ctx.body = reWriteImport(fs.readFileSync(p, 'utf-8'));
  } else if (url.startsWith('/@modules/')) {
    // 裸模块名称
    const moduleName = url.replace('/@modules/', '');
    const prefix = path.join(__dirname, '../node_modules', moduleName);
    const { module } = require(`${prefix}/package.json`);
    const filePath = path.join(prefix, module);
    const ret = fs.readFileSync(filePath, 'utf-8');
    ctx.type = 'application/javascript';
    ctx.body = reWriteImport(ret);
  }else if(url.indexOf('.vue') > -1){
    // 获取路径
    const p = path.join(__dirname, url.split('?')[0]);
    const ast = compilerSFC.parse(fs.readFileSync(p, 'utf-8'));
    if(!query.type){
      // 获取脚本部分的内容
      let script = ''
      if(ast.descriptor.script){
        const scriptContent = ast.descriptor.script.content;
        // 默认替换导出为一个常量
        script = scriptContent.replace('export default ', 'const __script = ');
      }
      ctx.type = 'application/javascript';
      ctx.body = `
      ${reWriteImport(script)}
      import {render as __render} from '${url}?type=template'
      __script.render = __render;
      export default __script;
      `
    }else if(query.type === 'template'){
      // 获取模板部分的内容
      const templateContent = ast.descriptor.template.content;
      const render = compilerDOM.compile(templateContent, {mode: 'module'}).code;
      ctx.type = 'application/javascript';
      ctx.body = reWriteImport(render);
    }
   
  }
});

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000');
});
