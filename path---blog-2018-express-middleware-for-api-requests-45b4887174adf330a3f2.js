webpackJsonp([0x67a765ccf0e3],{535:function(n,s){n.exports={data:{blog:{html:'<p>Recently I needed to create a NextJS app that made authenticated API calls, and couldn\'t reveal it\'s credentials to the client. The solution was simple, I had to integrate Express into the app. But how do you fetch data from the API and pass it down to a page?</p>\n<blockquote>\n<p>This process assumes you have an environment setup with NextJS, Express, an isomorphic fetch solution, and dotenv (for ENV variables). If you follow the NextJS guide for dynamic routing you be mostly there. But it should be pretty easy to adapt to other server frameworks.</p>\n</blockquote>\n<h2>Async or bust</h2>\n<p>I tried to first fetch the data in a separate function and call it before the page was rendered in the route:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code class="language-js"><span class="token keyword">const</span> credentials <span class="token operator">=</span> <span class="token punctuation">{</span>\n  method<span class="token punctuation">:</span> <span class="token string">\'get\'</span><span class="token punctuation">,</span>\n  headers<span class="token punctuation">:</span> <span class="token punctuation">{</span>\n    <span class="token string">\'Content-Type\'</span><span class="token punctuation">:</span> <span class="token string">\'application/json\'</span><span class="token punctuation">,</span>\n    <span class="token string">\'Authorization\'</span><span class="token punctuation">:</span> <span class="token string">\'Basic \'</span> <span class="token operator">+</span> <span class="token function">btoa</span><span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>API_USER <span class="token operator">+</span> <span class="token string">":"</span> <span class="token operator">+</span> process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>API_VENDOR<span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n\n<span class="token keyword">function</span> <span class="token function">fetchApi</span> <span class="token punctuation">(</span>endpoint<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token function">fetch</span><span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>API_URL <span class="token operator">+</span> endpoint<span class="token punctuation">,</span> credentials<span class="token punctuation">)</span>\n    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>r <span class="token operator">=></span> r<span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n\n    server<span class="token punctuation">.</span><span class="token keyword">get</span><span class="token punctuation">(</span><span class="token string">\'/facilities\'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token function">fetchApi</span><span class="token punctuation">(</span><span class="token string">\'/facilities/v1/\'</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>data <span class="token operator">=></span> <span class="token keyword">return</span> data<span class="token punctuation">)</span>\n\n      <span class="token keyword">return</span> app<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">,</span> <span class="token string">\'/facilities\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> data <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>This resulted in the page rendering and loading, and the data loading afterwards. Simple mistake, especially if you come from a background that isn\'t asynchronous. </p>\n<p>But how do you create an async Express route? Shockingly easily apparently:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code class="language-js">    server<span class="token punctuation">.</span><span class="token keyword">get</span><span class="token punctuation">(</span><span class="token string">\'/facilities\'</span><span class="token punctuation">,</span> <span class="token keyword">async</span> <span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">fetchApi</span><span class="token punctuation">(</span><span class="token string">\'/facilities/v1/\'</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>data <span class="token operator">=></span> <span class="token keyword">return</span> data<span class="token punctuation">)</span>\n\n      <span class="token keyword">return</span> app<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">,</span> <span class="token string">\'/facilities\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> data <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>Add an async before the function that renders your route -- *because don\'t stress it, it\'s easy to forget that you\'re working <strong>inside</strong> a function*. Now you just slap an await on Promise you want to fetch before page load.</p>\n<h2>But can we make it reusable?</h2>\n<p>I needed to fetch data across many routes, with many different requests to different endpoints. Rather than repeating code in every route to make the API request, we make a <strong>middleware</strong> that does it and dumps the data in the <code class="language-text">res.locals</code> (which is accessible in our route).</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code class="language-js"><span class="token comment">// Credentials for authenticated fetch calls to API</span>\n<span class="token keyword">const</span> credentials <span class="token operator">=</span> <span class="token punctuation">{</span>\n  method<span class="token punctuation">:</span> <span class="token string">\'get\'</span><span class="token punctuation">,</span>\n  headers<span class="token punctuation">:</span> <span class="token punctuation">{</span>\n    <span class="token string">\'Content-Type\'</span><span class="token punctuation">:</span> <span class="token string">\'application/json\'</span><span class="token punctuation">,</span>\n    <span class="token string">\'Authorization\'</span><span class="token punctuation">:</span> <span class="token string">\'Basic \'</span> <span class="token operator">+</span> <span class="token function">btoa</span><span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>API_USER <span class="token operator">+</span> <span class="token string">":"</span> <span class="token operator">+</span> process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>API_VENDOR<span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n\n<span class="token comment">/**\n * Facade for fetch preloaded with authentication credentials\n * to easily use in any other function\n */</span>\n<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">fetchApi</span> <span class="token punctuation">(</span>endpoint<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token keyword">await</span> <span class="token function">fetch</span><span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>API_URL <span class="token operator">+</span> endpoint<span class="token punctuation">,</span> credentials<span class="token punctuation">)</span>\n    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>r <span class="token operator">=></span> r<span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n\n<span class="token comment">/**\n * A function that returns the middleware function\n * We nest the middleware in a function so we can \n * pass an endpoint, making the middleware more reusable\n */</span>\n<span class="token keyword">function</span> <span class="token function">getData</span><span class="token punctuation">(</span>endpoint<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">,</span> next<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    \n    <span class="token comment">/**\n     * Here we create an async function so\n     * we can load the data before the page renders\n     */</span>\n    <span class="token keyword">const</span> fetchData <span class="token operator">=</span> <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token keyword">await</span> <span class="token function">fetchApi</span><span class="token punctuation">(</span>endpoint<span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>data <span class="token operator">=></span> <span class="token punctuation">{</span>\n          <span class="token comment">// We place the data in res.locals to access in the route later</span>\n          res<span class="token punctuation">.</span>locals<span class="token punctuation">.</span>data <span class="token operator">=</span> data\n          <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span>        \n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token function">fetchData</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n\napp<span class="token punctuation">.</span><span class="token function">prepare</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> server <span class="token operator">=</span> <span class="token function">express</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n\n    server<span class="token punctuation">.</span><span class="token keyword">get</span><span class="token punctuation">(</span><span class="token string">\'/facilities\'</span><span class="token punctuation">,</span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token string">\'/facilities/v1/\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> app<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">,</span> <span class="token string">\'/facilities\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> data<span class="token punctuation">:</span> res<span class="token punctuation">.</span>locals<span class="token punctuation">.</span>data <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>The code explains it a bit, but I had to nest the middleware function inside another function in order to pass the endpoint parameter. It\'s the way that JS works, similar to when you use <code class="language-text">.map()</code> or <code class="language-text">.filter()</code> on an array and you want to pass a parameter but can\'t. It\'s an encapsulation issue caused by the way Express interprets it\'s middleware, forcing you to wrap it what the React community calls a "HOC", or a function that returns another function (so you can pass additional "props" to the child function - or component in React\'s case).</p>\n<p>Now in any route we simply add the middleware <code class="language-text">getData(endpoint)</code>.</p>\n<blockquote>\n<p>You could also just do a fetch in the middleware <strong>without the async</strong> and rely on <code class="language-text">next()</code> function in the promise chain. It\'ll hold the progress until the loading is complete and then provide the "next" function (usually the render function). I just left everything async just in case I refactor it out of the middleware.</p>\n</blockquote>\n<h3>Super middleware</h3>\n<p>You could take this middleware and apply it to the entire application (rather than a single route), and use the <code class="language-text">req.params</code> object to grab dynamic route variables (like a blog post ID, or in this case, a string that describes an endpoint). </p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code class="language-js"><span class="token keyword">function</span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> endpoint <span class="token operator">=</span> req<span class="token punctuation">.</span>params<span class="token punctuation">.</span>endpoint\n  <span class="token keyword">return</span> <span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">,</span> next<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    \n    <span class="token comment">/**\n     * Here we create an async function so\n     * we can load the data before the page renders\n     */</span>\n    <span class="token keyword">const</span> fetchData <span class="token operator">=</span> <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token keyword">await</span> <span class="token function">fetchApi</span><span class="token punctuation">(</span>endpoint<span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>data <span class="token operator">=></span> <span class="token punctuation">{</span>\n          <span class="token comment">// We place the data in res.locals to access in the route later</span>\n          res<span class="token punctuation">.</span>locals<span class="token punctuation">.</span>data <span class="token operator">=</span> data\n          <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span>        \n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token function">fetchData</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n\n   <span class="token comment">// later in the app...</span>\n    server<span class="token punctuation">.</span><span class="token keyword">get</span><span class="token punctuation">(</span><span class="token string">\'/:endpoint\'</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> app<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> res<span class="token punctuation">,</span> req<span class="token punctuation">.</span>params<span class="token punctuation">.</span>endpoint<span class="token punctuation">,</span> <span class="token punctuation">{</span> data<span class="token punctuation">:</span> res<span class="token punctuation">.</span>locals<span class="token punctuation">.</span>data <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>This allows for a completely dynamic connection to whichever API you\'re using, so depending on how large (and preferably simple) it is to access, you can use <strong>one middleware to rule them all.</strong></p>\n<h2>I ❤️ middleware</h2>\n<p>Middleware makes life so much easier, and makes application code so much slimmer. If you can find a way to simplify this code (without getting too deep into ES6 land), I challenge you to post it up in the comments! I\'m always interested in discovering and sharing the most efficient solutions to common problems.</p>\n<p>Hope that helps! ✌️\nRyo </p>\n<hr>\n<p><strong>References</strong>:</p>\n<ul>\n<li><a href="https://expressjs.com/en/guide/using-middleware.html">ExpressJS Middleware</a></li>\n<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function">MDN: async function</a></li>\n<li><a href="https://hackernoon.com/middleware-the-core-of-node-js-apps-ab01fee39200">Middleware: THE core of node.js backend apps</a></li>\n<li><a href="https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016">Async Express routes</a></li>\n</ul>',frontmatter:{title:"Express Middleware for API Requests",cover_image:{publicURL:"/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b.jpg",childImageSharp:{sizes:{tracedSVG:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='267' viewBox='0 0 400 267' version='1'%3E%3Cpath d='M0 74c0 50 0 73 1 72l3-2c2 0 2 0 1-1-2-2-1-3 2-3 1 1 4 0 6-1h3l2-1 2-2 4-2 8-4 5-2 3-1h4l2-2c2-1 3-1 2-4 0-2 0-3 2-4 1-1 2-2 1-3l1-2h1l2-3 2-2 2-1 4 1c4 1 7 4 7 6l2-4 2-1 2-1h1l1 2 3 3 2-2c1-3 3-4 2-1h1l3-1 2-1 2-1 2 1 3 1c2 0 2 0 1-1v-1l-1-1c-2-1-1-1 3-1l5 1h6c1-1 1 0 1 1s0 2 1 1 6 0 6 1h4l3 1h4l-2-2-4-1c-2 1-5 1-5-1l2-1 1 1h2c3-2 5-1 5 1 1 2 1 2 3 2 5-2 9-2 9-1v1l2-1-1-1-1-1 2-1c2 1 2 1 2 3l1 2 1-1 1-1v2h2l1-2 10 1 1-1-3-1v-1h10l2 1v1h4c5 0 6-1 3-1l-3-1 7-1c3 0 5 0 4 1l-2 1-2 1c-2 0-2 0-1 1l4 4 1 1 1-2h1v3l1 1 1-2c1-2 2-2 17-2h24l4-1 4-1 4-1 4-1 2-1 3-1-2-1c-2 0-3-1-3-2l2-2a189 189 0 0 0 10 0l-4 1h4c5 0 8-2 5-3s-1-2 3-2c3 1 4 1 5-1v-3l-1 1c-1 2-8 1-8-1s1-2 4-2l4-1 4-1c4 1 7 0 7-2l3-3c5-2 7-4 7-5-1-1 0-2 2-3 3-1 4-2 5-4 0-2 2-3 2-3l2-2 2-2c1 0 3-1 4-5a64 64 0 0 1 7-11l1-3 1-4c1-2-1-7-3-9l-1-4-3-4-2-1 5-1 5-1-5-1c-5 0-5 0-4-2l1-2-2 1-3 1c-3 0-3 0-3-5V8h16V0H0v74' fill='lightgray' fill-rule='evenodd'/%3E%3C/svg%3E",src:"/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b-4e8db.jpg",srcSet:"/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b-7cc04.jpg 310w,\n/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b-69042.jpg 620w,\n/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b-4e8db.jpg 1240w,\n/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b-50ab1.jpg 1860w,\n/static/Express-Middleware-for-API-Requests-1920px-52330e681ae16f3c2210acb276021f1b-e738f.jpg 1920w"}}},date:"23 July, 2018",tags:["nextjs","express","js","api","es6","tips"],section:"blog"},fields:{slug:"/blog/2018/express-middleware-for-api-requests/"}},relatedPosts:{edges:[{node:{html:'<p>Have you been developing a <a href="http://nextjs.org">NextJS</a> app with dynamic routing (using maybe Express), and found that every time you make a change you have to do the tedious process of shutting down the server (CTRL+C) and restarting it? (<code class="language-text">npm run dev</code>).</p>\n<p>If you\'re used to working with <a href="http://nodejs.org">NodeJS</a>, or <a href="https://expressjs.com/">ExpressJS</a>, you\'ve probably come across <a href="https://github.com/remy/nodemon">nodemon</a>. It\'s a utility that enables hot reloading on Node-based servers, so that whenever you make a change to a server file and save -- it instantly starts to restart without any prompt from your part.</p>\n<p>But <strong>nodemon doesn\'t work out of the box with NextJS</strong> and requires a <em>small amount</em> of configuration. If you try running nodemon without a config or the proper CLI params, you\'ll find that your server will start acting <em>real wonky</em>. My server started restarting infinitely, because it was detecting changes each time NextJS compiled, triggering an infinite loop of compilations.</p>\n<blockquote>\n<p>This guide assumes you have a NextJS project with dynamic routing setup. You can find a few in <a href="https://github.com/zeit/next.js/tree/master/examples">the examples section of the NextJS repo</a> </p>\n</blockquote>\n<h2>The solution?</h2>\n<p>Nodemon accepts a configuration file, which allows you have a greater degree of control over the process. By adding a few values to this file, we can solve all our issues.</p>\n<h3>Install nodemon</h3>\n<p>If you haven\'t already, install nodemon:</p>\n<p><code class="language-text">npm install --save-dev nodemon</code></p>\n<h3>Create the config file</h3>\n<p>Create a <code class="language-text">nodemon.json</code> file in the project root and paste the following into it:</p>\n<div class="gatsby-highlight">\n      <pre class="language-json"><code class="language-json"><span class="token punctuation">{</span>\n    <span class="token property">"verbose"</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n    <span class="token property">"ignore"</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">"node_modules"</span><span class="token punctuation">,</span> <span class="token string">".next"</span><span class="token punctuation">]</span><span class="token punctuation">,</span>\n    <span class="token property">"watch"</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">"server/**/*"</span><span class="token punctuation">,</span> <span class="token string">"server.js"</span><span class="token punctuation">]</span><span class="token punctuation">,</span>\n    <span class="token property">"ext"</span><span class="token operator">:</span> <span class="token string">"js json"</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>This tells nodemon to ignore the <code class="language-text">.next</code> folder, which is used as a cache for the Next compiler (and triggers the infinite reload). And we also tell it which file to watch for changes from. I keep my server file in a separate server folder, since I have stuff like routes/middleware/etc that need separate files and folders.</p>\n<h3>Update your npm dev script</h3>\n<p>Now you can modify your <code class="language-text">package.json</code> and update the \'dev\' script value to use nodemon instead of the default <code class="language-text">node server.js</code>:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code class="language-js">  <span class="token string">"scripts"</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>\n    <span class="token string">"dev"</span><span class="token punctuation">:</span> <span class="token string">"nodemon -w server/server.js server/server.js"</span><span class="token punctuation">,</span>\n    <span class="token string">"build"</span><span class="token punctuation">:</span> <span class="token string">"next build"</span><span class="token punctuation">,</span>\n    <span class="token string">"start"</span><span class="token punctuation">:</span> <span class="token string">"NODE_ENV=production node server.js"</span>\n  <span class="token punctuation">}</span><span class="token punctuation">,</span>\n</code></pre>\n      </div>\n<p>Now you can run <code class="language-text">npm run dev</code> and you\'ll have yourself a hot-reloading server.</p>\n<p>I found this solution on <a href="https://github.com/zeit/next.js/issues/791">the NextJS Github issues</a>, where a people were having - go figure - the same issue.</p>\n<p>Hope that helps ✌️\nRyo</p>\n<hr>\n<p><strong>References</strong>:</p>\n<ul>\n<li><a href="https://github.com/remy/nodemon">nodemon</a></li>\n<li><a href="https://github.com/zeit/next.js/issues/791">NextJS Github issue - hot reloading</a></li>\n</ul>',frontmatter:{title:"NextJS Tip: Hot reloading for dynamic servers",cover_image:{publicURL:"/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f.jpg",childImageSharp:{sizes:{src:"/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f-4e8db.jpg",srcSet:"/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f-7cc04.jpg 310w,\n/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f-69042.jpg 620w,\n/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f-4e8db.jpg 1240w,\n/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f-50ab1.jpg 1860w,\n/static/NextJS-Tips-Nodemon-1920px-6a346c8ffe4684585c23388268cc5d1f-e738f.jpg 1920w"}}},date:"25 July, 2018",tags:["nextjs","express","js","es6","tips"]},fields:{slug:"/blog/2018/nextjs-tip-hot-reloading-for-dynamic-servers/"}}},{node:{html:'<p>Recently I decided to start experimenting with <a href="https://nextjs.org/">NextJS</a> as a way to implement a React frontend for <a href="http://kushy.net">Kushy</a>. Currently Kushy runs off Laravel directly, instead of being a separate app that consumes a Laravel API. I\'ve been looking to dive deep in React with Kushy, but it\'s been difficult finding a framework that scales properly, and I\'ve been avoiding doing it from scratch (crafting my own Webpack config, route and CSS splitting, <em>all that jazz</em>). </p>\n<p>The goal of this experiment was to create a NextJS application for Kushy using the <a href="http://kushy.net/developers/">Kushy API</a>, and discover what it takes to roughly create some basic functionality of Kushy (browsing individual businesses by slug).</p>\n<h2>Example</h2>\n\n  <a class="gatsby-resp-image-link" href="/static/kushy-frontend-nextjs-screenshot-from-heroku-3e327eae8d5018fd9cc0730cbe38abd7-ca02f.png" style="display: block" target="_blank" rel="noopener">\n  \n  <span class="gatsby-resp-image-wrapper" style="position: relative; display: block; ; max-width: 774px; margin-left: auto; margin-right: auto;">\n    <span class="gatsby-resp-image-background-image" style="padding-bottom: 103.87596899224806%; position: relative; bottom: 0; left: 0; background-image: url(&apos;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAYAAABG1c6oAAAACXBIWXMAAAsSAAALEgHS3X78AAADWklEQVQ4y5WV72+TVRTHn/9AE18Z35gY4xsDxuhe8E59oaJGZVkYsgy3+CNZ/JFFogMHyAYu0UQ0ShyoLIxtbAaIJMRgTMwYbeNgo6Prjy10jJU+/UXbp+3WPm3X9uO9d21d3RB2kpNznnvv+Z7vuT3nVrNvqmP8oUe48Vknhn2K2JiFmMVG9LKVqMVKTFj1LdaNiUkCP/7E3w8+zOQTm3E+vxX7k88w9fQW3K/WY99ch+bv68f3Qy+h3y9iuDzEpxwY007i1x3EHdPCd1X9xMysSGTBd7QXGRccOYN+cgD91BDBM+fQ+wfRTGBxcVFpIhgioeuk4gZxPYARDgs/juG7TTIWI53LkV5eRsZIzZTtal/LCKCcaZLPZlnO55VmhU8JJTnh5wVQXqwrK1WeL8fkzWzVzywtCYamqQKLpVLZFpV1357HNuNgI5ITyTTJJi/KkFIqg87qC9R1tPJo25tcdk+ptUKxqPbvplVAWdrX5wfoOXtSLSbTi7x8uJ2ndjfz2Af1DI39UQYsVAP/K2sAP+3/ngeaX6DvrwscGD7O4x82sPPb/WzZ+y7RVKLmSu4NKMTqua5KfK+3R9n2viNs+qSJztPH1pR7T8CMmVEfbce/YuuhdlqOHuKjE9/wbEcLQSNaZVe6X4bpzAqg706I9hNH+O7CCC92f8wll73m7ipB6zGtAay0TUUcC17mI4Gag6sD12NaW7JgeOuWj/l5Hws+P6FAWNaIvArZUvKQ1EKhUG32/2WYTqe5euUKo6OXsNpsWK1WJiavYbNZle90urCI+fV6vfdfciwWJRAIEolE0MUsG4aBTLQkRmlZNL1kpxhuBNDv96sHIpVKrTwUiQTJZFLNcE3g6h9HJKkoorWqgDIwGAwqNndri/VGbc0si+SaKdtGoFPJKEBrdBWLyr48W1xKEz13njtDvxIZHCF29jdMQUzLlu9moyLfpNDAMIGf+9CP/ULo1GlktVp44hqOz7/A2d2Do6OTuf1dePceYG5fF3Nifa7zIDe7vsQr/iJuHhR2zz5xpvvffaki5sbuPYQv/okWGB1jfMcurr7Txvi2Rjw7W3E3NOF56208jc24G3cx2/I+rje2r9j6Hcw0taq96Ve24XytHtfrDTieewl9cJh/ANkx6M6URI7CAAAAAElFTkSuQmCC&apos;); background-size: cover; display: block;">\n      <img class="gatsby-resp-image-image" style="width: 100%; height: 100%; margin: 0; vertical-align: middle; position: absolute; top: 0; left: 0; box-shadow: inset 0px 0px 0px 400px white;" alt="A screenshot of the Kushy frontend app running on Heroku" title="" src="/static/kushy-frontend-nextjs-screenshot-from-heroku-3e327eae8d5018fd9cc0730cbe38abd7-ca02f.png" srcset="/static/kushy-frontend-nextjs-screenshot-from-heroku-3e327eae8d5018fd9cc0730cbe38abd7-fc16d.png 270w,\n/static/kushy-frontend-nextjs-screenshot-from-heroku-3e327eae8d5018fd9cc0730cbe38abd7-f3790.png 540w,\n/static/kushy-frontend-nextjs-screenshot-from-heroku-3e327eae8d5018fd9cc0730cbe38abd7-ca02f.png 774w" sizes="(max-width: 774px) 100vw, 774px">\n    </span>\n  </span>\n  \n  </a>\n    \n<p>You can check out the project deployed on <strong>Heroku</strong>, or browse the source code on Github:</p>\n<ul>\n<li><a href="https://kushy-frontend-next.herokuapp.com/shop/chronic-pain-relief-center">Heroku - Live test site showing Shop Slug</a></li>\n<li><a href="https://kushy.net/shops/chronic-pain-relief-center">Live page on Kushy for comparison</a></li>\n<li><a href="https://github.com/whoisryosuke/kushy-frontend-next">Github repo</a></li>\n</ul>\n<h2>Issues</h2>\n<p>There were a couple of issues I encountered immediately while trying to use NextJS. Luckily only a couple.</p>\n<h3>Dynamic Routing (/posts/{slug})</h3>\n<p>NextJS doesn\'t have this out of the box. You have to make a NodeJS server (in this case Express) with your dynamic routes.</p>\n<blockquote>\n<p>See: <a href="https://github.com/zeit/next.js/#custom-server-and-routing">NextJS docs on custom server/routing</a>, <a href="https://medium.com/@diamondgfx/nextjs-lessons-learned-part-2-f1781237cf5c">this article</a>, <a href="https://github.com/fridays/next-routes">this plugin</a>, </p>\n</blockquote>\n<p>Ended up using plugin (<a href="https://www.npmjs.com/package/next-routes">https://www.npmjs.com/package/next-routes</a>) to accomplish it "easily". In the future though I\'ll just use the Express API.</p>\n<h3>Deployment</h3>\n<p>NextJS can be Jekyll or other static site generators. You run a build process everytime the code changes, then you restart the server.</p>\n<p><code class="language-text">npm run build</code>\n<code class="language-text">npm run start</code></p>\n<p>Makes NextJS perfect for something like Heroku that handles that process. Or maybe not, if they don\'t have proxying/multiple instances -- since NextJS performs best when clustered. </p>\n<blockquote>\n<p>It is possible to run a static build process like GatsbyJS that can run on a CDN/host like Github Pages or Netlify. But you lose the dynamic routing and SSR that Node and Express provide. That\'s where GatsbyJS shines, it pulls all the content to live statically, while NextJS pulls on demand.</p>\n</blockquote>\n<h3>User Login / Authorization</h3>\n<p>NextJS doesn\'t come built in with any functionality for "protected" routes, if you needed to lock certain pages behind a login authentication. Luckily, it wasn\'t too difficult with the way NextJS works on the server and client-side.</p>\n<p>To login a user, I used an API using the OAuth2.0 flow, so I redirected the user to the API\'s login. Once the user logged in and approved the app, they\'re redirected back a callback page on the app. This page makes one last request to the API (using a secret token the API sent to the callback), and the API responds one last time with an access token or JWT (JSON Web Token) for the user.</p>\n<p>Here\'s where the magic of NextJS comes in. We store the token in a cookie on the server-side, which allows us to grab it from anywhere (server or client). When we need the token, we parse it from the server-side headers (passed through the <code class="language-text">getInitialProps()</code> method) -- or use a library like <code class="language-text">js-cookie</code> to grab the cookies client-side.</p>\n<p>To create a protected route, you make a HOC that checks for the cookie in the <code class="language-text">getInitialProps()</code> and <code class="language-text">componentDidMount()</code> lifecycles. If you find the token\'s cookie, the HOC loads the page component. But if it can\'t find the cookie, it\'ll redirect the user to a public page (usually a login). </p>\n<h2>Conclusion</h2>\n<p>Much like any good framework, once you know what you\'re doing -- and you figure out how it handles certain things -- it becomes effortless to create what you want. I walked away from working on NextJS with my mind buzzing with several apps I could whip out now that I could apply them. While I\'m not sure this will be the framework we use for the Kushy frontend, it\'s definitely a great contender.</p>\n<p>Kanpai 🍻\nRyo</p>\n<hr>\n<p><strong>References</strong>:</p>\n<ul>\n<li><a href="https://github.com/whoisryosuke/kushy-frontend-next">kushy-frontend-next on Github</a></li>\n<li><a href="https://nextjs.org/learn/basics/deploying-a-nextjs-app">NextJS - Deployment Guide</a></li>\n<li><a href="https://github.com/zeit/next.js/issues/929">NextJS - How to send request parameters to page (like post slug in URL)</a></li>\n<li><a href="https://www.npmjs.com/package/next-routes">next-routes - Dynamic routing for NextJS</a></li>\n<li><a href="https://github.com/zeit/next-plugins/issues/7">NextJS - How to use multiple plugins / configurations</a></li>\n<li><a href="https://medium.com/@diamondgfx/nextjs-lessons-learned-part-2-f1781237cf5c">Lessons Learned Building in Next.js pt2 - Brandon Richey</a></li>\n</ul>',
frontmatter:{title:"Kushy Frontend in NextJS",cover_image:{publicURL:"/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7.jpg",childImageSharp:{sizes:{src:"/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7-4e8db.jpg",srcSet:"/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7-7cc04.jpg 310w,\n/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7-69042.jpg 620w,\n/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7-4e8db.jpg 1240w,\n/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7-50ab1.jpg 1860w,\n/static/Kushy-Frontend-in-NextJS-1920px-241f404c512bfac3c82cb58059b09bd7-e738f.jpg 1920w"}}},date:"17 July, 2018",tags:["nextjs","js","kushy","react","frontend"]},fields:{slug:"/blog/2018/kushy-frontend-in-nextjs/"}}}]}},pathContext:{tag:"nextjs",slug:"/blog/2018/express-middleware-for-api-requests/"}}}});
//# sourceMappingURL=path---blog-2018-express-middleware-for-api-requests-45b4887174adf330a3f2.js.map