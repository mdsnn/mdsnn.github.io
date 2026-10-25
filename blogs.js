/**
 * Mwiko Sinyangwe - Engineering Blog Database
 * To add a new post, simply add an object to the `BLOG_POSTS` array below.
 */

window.BLOG_POSTS = [
  {
    id: 'tall-stack-2026',
    title: 'Why the TALL Stack is Still My Unbeatable Superpower',
    date: 'Oct 24, 2026',
    readTime: '5 min read',
    tags: ['Laravel', 'Livewire', 'Tailwind', 'Architecture'],
    summary: 'How combining Tailwind CSS, Alpine.js, Laravel, and Livewire lets solo developers build production-grade SaaS apps faster than entire teams.',
    content: `
      <h3>The Single-Developer Superpower</h3>
      <p>In modern web engineering, the constant debate between heavy Single Page Applications (SPAs) and traditional server-side rendering often leaves developers overwhelmed by tooling fatigue. You configure Vite, GraphQL or REST endpoints, TypeScript types for both client and server, state management libraries, and authentication handshakes.</p>
      
      <p>The <strong>TALL stack</strong> (Tailwind, Alpine.js, Laravel, Livewire) collapses this entire layer of complexity into a single, cohesive developer loop:</p>
      
      <ul>
        <li><strong>Tailwind CSS:</strong> Rapid atomic styling that stays synchronized with your markup.</li>
        <li><strong>Alpine.js:</strong> Lightweight reactive micro-interactions (dropdowns, modals, toggles) without importing 50KB libraries.</li>
        <li><strong>Laravel:</strong> World-class backend tooling—Eloquent ORM, robust queues, authentication, and caching out of the box.</li>
        <li><strong>Livewire:</strong> Full-stack reactivity that allows PHP methods to update the DOM seamlessly via automated diffing.</li>
      </ul>

      <h3>Eliminating the API Serialization Tax</h3>
      <p>When you build with Laravel and Livewire, you don't spend half your sprint writing redundant API controllers, serialization DTOs, and frontend fetch hooks. Your UI component directly references your database models with complete security and validation built-in.</p>

      <blockquote>"The fastest code to maintain is the code you never had to write."</blockquote>

      <p>For founders and agile product teams, shipping velocity is everything. The TALL stack provides enterprise-grade resilience while keeping development iteration speed unmatched.</p>
    `
  },
  {
    id: 'laravel-multi-tenant',
    title: 'Architecting Scalable Multi-Tenant Platforms with Laravel',
    date: 'Sep 18, 2026',
    readTime: '7 min read',
    tags: ['PHP', 'Laravel', 'MySQL', 'DevOps'],
    summary: 'A deep dive into building multi-tenant databases, schema isolation, and automated tenant routing.',
    content: `
      <h3>Multi-Tenancy: Single DB vs. Separate DBs</h3>
      <p>When building SaaS platforms like <em>Laragigs</em> or custom e-commerce engines, choosing the correct tenant isolation architecture dictates your infrastructure overhead for years to come.</p>

      <h3>1. Column-Based Tenant Scoping (Shared Database)</h3>
      <p>For early-to-mid stage applications, leveraging Laravel's Global Query Scopes with a <code>tenant_id</code> foreign key provides the most cost-effective and scalable setup:</p>

      <pre><code>trait BelongsToTenant {
    protected static function bootBelongsToTenant() {
        static::addGlobalScope('tenant', function (Builder $builder) {
            $builder->where('tenant_id', session('active_tenant_id'));
        });
    }
}</code></pre>

      <h3>2. Dynamic Connection Switching (Isolated Databases)</h3>
      <p>When dealing with strict compliance or heavy data pipelines, switching database connections per tenant request via middleware ensures complete cryptographic and physical data separation.</p>

      <h3>Key Takeaways</h3>
      <p>Always build automated tests around query scopes to prevent tenant data leakage, and rely on queue-based background workers to process heavy analytical reports asynchronously.</p>
    `
  },
  {
    id: 'modern-react-state',
    title: 'Bridging React and Modern Backend Frameworks',
    date: 'Aug 12, 2026',
    readTime: '4 min read',
    tags: ['React', 'JavaScript', 'Frontend'],
    summary: 'Patterns for embedding highly dynamic React component islands inside server-rendered Laravel and Django web apps.',
    content: `
      <h3>The Hybrid Island Architecture</h3>
      <p>You don't always have to choose 100% SPA or 100% server-side HTML. For high-interactivity widgets—like interactive dashboards, real-time calculators, and kanban boards—mounting lightweight React components into blade templates provides the ideal balance.</p>

      <h3>Predictable State with Minimal Dependencies</h3>
      <p>By leveraging native browser events and custom hooks, React islands can talk cleanly to server endpoints without introducing heavy global stores unless strictly warranted.</p>
    `
  }
];
