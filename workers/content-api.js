/**
 * Cloudflare Worker - Content API
 * 从 KV 存储读取内容数据
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let data = null;

      // 根据路径返回不同的数据
      switch (path) {
        case '/api/projects':
          data = await env.CONTENT_KV.get('projects', { type: 'json' });
          break;
        case '/api/photography':
          data = await env.CONTENT_KV.get('photography', { type: 'json' });
          break;
        case '/api/calligraphy':
          data = await env.CONTENT_KV.get('calligraphy', { type: 'json' });
          break;
        case '/api/blog':
          data = await env.CONTENT_KV.get('blog', { type: 'json' });
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: corsHeaders }
          );
      }

      // 如果 KV 中没有数据，返回空数组
      if (!data) {
        data = [];
      }

      return new Response(JSON.stringify(data), {
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
