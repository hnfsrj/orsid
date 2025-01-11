
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (246:0) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(246:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (239:0) {#if componentParams}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(239:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, _loc => _loc.location);
    const querystring = derived(loc, _loc => _loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const NavStore = writable({
        "fix":false,
        "wide":false,
        "drop":false,
        "services":false
    });

    const OtherStates = writable({
        "split":false
    });


    const ServicesState = writable({
        "chosen": "cat1"
    });

    /* src/components/Nav.svelte generated by Svelte v3.59.2 */
    const file$l = "src/components/Nav.svelte";

    // (138:8) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Orsid Juhak";
    			attr_dev(p, "class", "name svelte-iv25jf");
    			add_location(p, file$l, 139, 12, 3699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(138:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (136:8) {#if fix}
    function create_if_block_6(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Orsid Juhak";
    			attr_dev(p, "class", "name svelte-iv25jf");
    			add_location(p, file$l, 136, 12, 3589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(136:8) {#if fix}",
    		ctx
    	});

    	return block;
    }

    // (143:8) {#if !wide}
    function create_if_block_4(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*drop*/ ctx[1]) return create_if_block_5;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(143:8) {#if !wide}",
    		ctx
    	});

    	return block;
    }

    // (146:12) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "menu img svelte-iv25jf");
    			add_location(div, file$l, 146, 16, 3871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(146:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (144:12) {#if drop}
    function create_if_block_5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "close img svelte-iv25jf");
    			add_location(div, file$l, 144, 16, 3805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(144:12) {#if drop}",
    		ctx
    	});

    	return block;
    }

    // (153:4) {#if drop || wide}
    function create_if_block$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = (/*wide*/ ctx[2] || !/*services*/ ctx[0]) && create_if_block_2(ctx);
    	let if_block1 = /*services*/ ctx[0] && !/*wide*/ ctx[2] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*wide*/ ctx[2] || !/*services*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*services*/ ctx[0] && !/*wide*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(153:4) {#if drop || wide}",
    		ctx
    	});

    	return block;
    }

    // (155:8) {#if wide || !services}
    function create_if_block_2(ctx) {
    	let div1;
    	let p0;
    	let t1;
    	let div0;
    	let p1;
    	let t3;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let if_block = /*services*/ ctx[0] && /*wide*/ ctx[2] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "About";
    			t1 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = "Services";
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Team";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "Contact";
    			attr_dev(p0, "class", "svelte-iv25jf");
    			add_location(p0, file$l, 157, 16, 4067);
    			attr_dev(p1, "class", "svelte-iv25jf");
    			add_location(p1, file$l, 160, 20, 4174);
    			set_style(div0, "position", "relative");
    			attr_dev(div0, "class", "bottom_services");
    			add_location(div0, file$l, 158, 16, 4096);
    			attr_dev(p2, "class", "svelte-iv25jf");
    			add_location(p2, file$l, 181, 16, 4976);
    			attr_dev(p3, "class", "svelte-iv25jf");
    			add_location(p3, file$l, 182, 16, 5004);
    			attr_dev(div1, "class", "bottom svelte-iv25jf");
    			add_location(div1, file$l, 155, 12, 4013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t4);
    			append_dev(div1, p2);
    			append_dev(div1, t6);
    			append_dev(div1, p3);
    		},
    		p: function update(ctx, dirty) {
    			if (/*services*/ ctx[0] && /*wide*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(155:8) {#if wide || !services}",
    		ctx
    	});

    	return block;
    }

    // (163:20) {#if services && wide}
    function create_if_block_3(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let a0;
    	let p1;
    	let t3;
    	let a1;
    	let p2;
    	let t5;
    	let a2;
    	let p3;
    	let t7;
    	let p4;
    	let t9;
    	let a3;
    	let p5;
    	let t11;
    	let a4;
    	let p6;
    	let t13;
    	let a5;
    	let p7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Import";
    			t1 = space();
    			a0 = element("a");
    			p1 = element("p");
    			p1.textContent = "Food Oil";
    			t3 = space();
    			a1 = element("a");
    			p2 = element("p");
    			p2.textContent = "Rice";
    			t5 = space();
    			a2 = element("a");
    			p3 = element("p");
    			p3.textContent = "Sugar";
    			t7 = space();
    			p4 = element("p");
    			p4.textContent = "Export";
    			t9 = space();
    			a3 = element("a");
    			p5 = element("p");
    			p5.textContent = "Coffee";
    			t11 = space();
    			a4 = element("a");
    			p6 = element("p");
    			p6.textContent = "Sesame";
    			t13 = space();
    			a5 = element("a");
    			p7 = element("p");
    			p7.textContent = "Kidney Beans";
    			attr_dev(p0, "class", "service_label svelte-iv25jf");
    			add_location(p0, file$l, 165, 28, 4349);
    			attr_dev(p1, "class", "svelte-iv25jf");
    			add_location(p1, file$l, 167, 43, 4431);
    			attr_dev(a0, "href", "/oil");
    			attr_dev(a0, "class", "svelte-iv25jf");
    			add_location(a0, file$l, 167, 28, 4416);
    			attr_dev(p2, "class", "svelte-iv25jf");
    			add_location(p2, file$l, 168, 44, 4495);
    			attr_dev(a1, "href", "/rice");
    			attr_dev(a1, "class", "svelte-iv25jf");
    			add_location(a1, file$l, 168, 28, 4479);
    			attr_dev(p3, "class", "svelte-iv25jf");
    			add_location(p3, file$l, 169, 45, 4556);
    			attr_dev(a2, "href", "/sugar");
    			attr_dev(a2, "class", "svelte-iv25jf");
    			add_location(a2, file$l, 169, 28, 4539);
    			attr_dev(p4, "class", "service_label svelte-iv25jf");
    			add_location(p4, file$l, 171, 28, 4602);
    			attr_dev(p5, "class", "svelte-iv25jf");
    			add_location(p5, file$l, 173, 46, 4715);
    			attr_dev(a3, "href", "/coffee");
    			attr_dev(a3, "class", "svelte-iv25jf");
    			add_location(a3, file$l, 173, 28, 4697);
    			attr_dev(p6, "class", "svelte-iv25jf");
    			add_location(p6, file$l, 174, 46, 4779);
    			attr_dev(a4, "href", "/sesame");
    			attr_dev(a4, "class", "svelte-iv25jf");
    			add_location(a4, file$l, 174, 28, 4761);
    			attr_dev(p7, "class", "svelte-iv25jf");
    			add_location(p7, file$l, 175, 45, 4842);
    			attr_dev(a5, "href", "/beans");
    			attr_dev(a5, "class", "svelte-iv25jf");
    			add_location(a5, file$l, 175, 28, 4825);
    			set_style(div, "position", "absolute");
    			set_style(div, "width", "250px");
    			attr_dev(div, "class", "dropdown svelte-iv25jf");
    			add_location(div, file$l, 164, 24, 4259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, a0);
    			append_dev(a0, p1);
    			append_dev(div, t3);
    			append_dev(div, a1);
    			append_dev(a1, p2);
    			append_dev(div, t5);
    			append_dev(div, a2);
    			append_dev(a2, p3);
    			append_dev(div, t7);
    			append_dev(div, p4);
    			append_dev(div, t9);
    			append_dev(div, a3);
    			append_dev(a3, p5);
    			append_dev(div, t11);
    			append_dev(div, a4);
    			append_dev(a4, p6);
    			append_dev(div, t13);
    			append_dev(div, a5);
    			append_dev(a5, p7);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(163:20) {#if services && wide}",
    		ctx
    	});

    	return block;
    }

    // (188:8) {#if services && !wide}
    function create_if_block_1(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let a0;
    	let p1;
    	let t3;
    	let a1;
    	let p2;
    	let t5;
    	let a2;
    	let p3;
    	let t7;
    	let p4;
    	let t9;
    	let a3;
    	let p5;
    	let t11;
    	let a4;
    	let p6;
    	let t13;
    	let a5;
    	let p7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Import";
    			t1 = space();
    			a0 = element("a");
    			p1 = element("p");
    			p1.textContent = "Food Oil";
    			t3 = space();
    			a1 = element("a");
    			p2 = element("p");
    			p2.textContent = "Rice";
    			t5 = space();
    			a2 = element("a");
    			p3 = element("p");
    			p3.textContent = "Sugar";
    			t7 = space();
    			p4 = element("p");
    			p4.textContent = "Export";
    			t9 = space();
    			a3 = element("a");
    			p5 = element("p");
    			p5.textContent = "Coffee";
    			t11 = space();
    			a4 = element("a");
    			p6 = element("p");
    			p6.textContent = "Sesame";
    			t13 = space();
    			a5 = element("a");
    			p7 = element("p");
    			p7.textContent = "Kidney Beans";
    			attr_dev(p0, "class", "service_label svelte-iv25jf");
    			add_location(p0, file$l, 190, 16, 5154);
    			attr_dev(p1, "class", "svelte-iv25jf");
    			add_location(p1, file$l, 192, 31, 5224);
    			attr_dev(a0, "href", "/oil");
    			attr_dev(a0, "class", "svelte-iv25jf");
    			add_location(a0, file$l, 192, 16, 5209);
    			attr_dev(p2, "class", "svelte-iv25jf");
    			add_location(p2, file$l, 193, 32, 5276);
    			attr_dev(a1, "href", "/rice");
    			attr_dev(a1, "class", "svelte-iv25jf");
    			add_location(a1, file$l, 193, 16, 5260);
    			attr_dev(p3, "class", "svelte-iv25jf");
    			add_location(p3, file$l, 194, 33, 5325);
    			attr_dev(a2, "href", "/sugar");
    			attr_dev(a2, "class", "svelte-iv25jf");
    			add_location(a2, file$l, 194, 16, 5308);
    			attr_dev(p4, "class", "service_label svelte-iv25jf");
    			add_location(p4, file$l, 196, 16, 5359);
    			attr_dev(p5, "class", "svelte-iv25jf");
    			add_location(p5, file$l, 198, 34, 5448);
    			attr_dev(a3, "href", "/coffee");
    			attr_dev(a3, "class", "svelte-iv25jf");
    			add_location(a3, file$l, 198, 16, 5430);
    			attr_dev(p6, "class", "svelte-iv25jf");
    			add_location(p6, file$l, 199, 34, 5500);
    			attr_dev(a4, "href", "/sesame");
    			attr_dev(a4, "class", "svelte-iv25jf");
    			add_location(a4, file$l, 199, 16, 5482);
    			attr_dev(p7, "class", "svelte-iv25jf");
    			add_location(p7, file$l, 200, 33, 5551);
    			attr_dev(a5, "href", "/beans");
    			attr_dev(a5, "class", "svelte-iv25jf");
    			add_location(a5, file$l, 200, 16, 5534);
    			attr_dev(div, "class", "dropdown svelte-iv25jf");
    			add_location(div, file$l, 189, 12, 5115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, a0);
    			append_dev(a0, p1);
    			append_dev(div, t3);
    			append_dev(div, a1);
    			append_dev(a1, p2);
    			append_dev(div, t5);
    			append_dev(div, a2);
    			append_dev(a2, p3);
    			append_dev(div, t7);
    			append_dev(div, p4);
    			append_dev(div, t9);
    			append_dev(div, a3);
    			append_dev(a3, p5);
    			append_dev(div, t11);
    			append_dev(div, a4);
    			append_dev(a4, p6);
    			append_dev(div, t13);
    			append_dev(div, a5);
    			append_dev(a5, p7);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(188:8) {#if services && !wide}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let nav;
    	let div;
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*fix*/ ctx[3]) return create_if_block_6;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = !/*wide*/ ctx[2] && create_if_block_4(ctx);
    	let if_block2 = (/*drop*/ ctx[1] || /*wide*/ ctx[2]) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "top svelte-iv25jf");
    			add_location(div, file$l, 133, 4, 3540);
    			attr_dev(nav, "class", "effect_down animate_down svelte-iv25jf");
    			toggle_class(nav, "fixation", /*fix*/ ctx[3]);
    			toggle_class(nav, "wide", /*wide*/ ctx[2]);
    			toggle_class(nav, "scrolled_wide", /*fix*/ ctx[3] && /*wide*/ ctx[2]);
    			add_location(nav, file$l, 131, 0, 3423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(nav, t1);
    			if (if_block2) if_block2.m(nav, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			}

    			if (!/*wide*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*drop*/ ctx[1] || /*wide*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(nav, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*fix*/ 8) {
    				toggle_class(nav, "fixation", /*fix*/ ctx[3]);
    			}

    			if (dirty & /*wide*/ 4) {
    				toggle_class(nav, "wide", /*wide*/ ctx[2]);
    			}

    			if (dirty & /*fix, wide*/ 12) {
    				toggle_class(nav, "scrolled_wide", /*fix*/ ctx[3] && /*wide*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let fix;
    	let wide;
    	let drop;
    	let services;
    	let $NavStore;
    	validate_store(NavStore, 'NavStore');
    	component_subscribe($$self, NavStore, $$value => $$invalidate(4, $NavStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);

    	function nav_buttons(e) {
    		let target = e.target;

    		if (target == document.querySelector('.menu')) {
    			NavStore.update(current_state => {
    				return { ...current_state, "drop": true };
    			});
    		} else if (target == document.querySelector('.close')) {
    			NavStore.update(current_state => {
    				return {
    					...current_state,
    					"drop": false,
    					"services": false
    				};
    			});
    		} else if (target == document.querySelector('.name')) {
    			document.querySelector('#landing').scrollIntoView({ behavior: 'smooth' });
    		} else if (target.matches('.bottom>div.bottom_services') || target.matches('.bottom>div.bottom_services>p')) {
    			NavStore.update(current_state => {
    				if (!services) {
    					return { ...current_state, "services": true };
    				} else {
    					return { ...current_state, "services": false };
    				}
    			});
    		} else {
    			NavStore.update(current_state => {
    				return {
    					...current_state,
    					"drop": false,
    					"services": false
    				};
    			});
    		}
    	}

    	function handle_scrolling() {
    		let fix = window.scrollY > document.querySelector('#landing').clientHeight;

    		if (fix) {
    			NavStore.update(current_state => {
    				return { ...current_state, "fix": true };
    			});
    		} else {
    			NavStore.update(current_state => {
    				return { ...current_state, "fix": false };
    			});
    		}
    	}

    	function navigation_function(e) {
    		const target = e.target;

    		if (target.matches('.bottom>p') && !(target.matches('.bottom>div.bottom_services') || target.matches('.bottom>div.bottom_services>p'))) {
    			const to = target.innerText.toLowerCase();
    			document.querySelector(`#${to}`).scrollIntoView({ behavior: 'smooth' });
    		} else {
    			if (services && !(target.matches('.bottom>div.bottom_services') || target.matches('.bottom>div.bottom_services>p'))) {
    				NavStore.update(current_state => {
    					return { ...current_state, "services": false };
    				});
    			}
    		}
    	}

    	const nav_observer = getContext('nav_observer');
    	let observeding;

    	onMount(() => {
    		observeding = document.querySelector('nav');
    		nav_observer.observe(observeding);
    		const top = document.querySelector('nav');

    		top.addEventListener('click', e => {
    			nav_buttons(e);
    		});

    		handle_scrolling();
    		window.addEventListener("scroll", handle_scrolling);

    		document.addEventListener("click", e => {
    			navigation_function(e);
    		});
    	});

    	onDestroy(() => {
    		top.removeEventListener('click', e => {
    			nav_buttons(e);
    		});

    		window.removeEventListener("scroll", handle_scrolling);

    		document.removeEventListener('click', e => {
    			navigation_function(e);
    		});

    		nav_observer.unobserve(observeding);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		onDestroy,
    		NavStore,
    		nav_buttons,
    		handle_scrolling,
    		navigation_function,
    		nav_observer,
    		observeding,
    		services,
    		drop,
    		wide,
    		fix,
    		$NavStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('observeding' in $$props) observeding = $$props.observeding;
    		if ('services' in $$props) $$invalidate(0, services = $$props.services);
    		if ('drop' in $$props) $$invalidate(1, drop = $$props.drop);
    		if ('wide' in $$props) $$invalidate(2, wide = $$props.wide);
    		if ('fix' in $$props) $$invalidate(3, fix = $$props.fix);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$NavStore*/ 16) {
    			$$invalidate(3, fix = $NavStore.fix);
    		}

    		if ($$self.$$.dirty & /*$NavStore*/ 16) {
    			$$invalidate(2, wide = $NavStore.wide);
    		}

    		if ($$self.$$.dirty & /*$NavStore*/ 16) {
    			$$invalidate(1, drop = $NavStore.drop);
    		}

    		if ($$self.$$.dirty & /*$NavStore*/ 16) {
    			$$invalidate(0, services = $NavStore.services);
    		}
    	};

    	return [services, drop, wide, fix, $NavStore];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/components/ServicesButton.svelte generated by Svelte v3.59.2 */
    const file$k = "src/components/ServicesButton.svelte";

    function create_fragment$l(ctx) {
    	let div;
    	let button_1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button_1 = element("button");
    			button_1.textContent = "Our Services";
    			attr_dev(button_1, "class", "effect_blur animation_blur svelte-t6w29n");
    			add_location(button_1, file$k, 54, 4, 960);
    			attr_dev(div, "class", "svelte-t6w29n");
    			toggle_class(div, "margined", /*margined*/ ctx[0]);
    			toggle_class(div, "unmargined", !/*margined*/ ctx[0]);
    			add_location(div, file$k, 52, 0, 890);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button_1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*margined*/ 1) {
    				toggle_class(div, "margined", /*margined*/ ctx[0]);
    			}

    			if (dirty & /*margined*/ 1) {
    				toggle_class(div, "unmargined", !/*margined*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handle_click() {
    	document.querySelector('#services').scrollIntoView({ behavior: 'smooth' });
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ServicesButton', slots, []);
    	let { margined = false } = $$props;
    	let button;
    	const observeElements = getContext('observeElements');
    	const unobserveElements = getContext('unobserveElements');
    	let elements = [];

    	onMount(() => {
    		// if (margined){
    		elements.push(document.querySelector('button'));

    		observeElements(elements);

    		// }
    		button = document.querySelector('button');

    		button.addEventListener('click', handle_click);
    	});

    	onDestroy(() => {
    		if (button) {
    			button.removeEventListener('click', handle_click);
    		}

    		if (margined) {
    			unobserveElements(elements);
    		}
    	});

    	const writable_props = ['margined'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ServicesButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('margined' in $$props) $$invalidate(0, margined = $$props.margined);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		onMount,
    		margined,
    		button,
    		handle_click,
    		observeElements,
    		unobserveElements,
    		elements
    	});

    	$$self.$inject_state = $$props => {
    		if ('margined' in $$props) $$invalidate(0, margined = $$props.margined);
    		if ('button' in $$props) button = $$props.button;
    		if ('elements' in $$props) elements = $$props.elements;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [margined];
    }

    class ServicesButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { margined: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ServicesButton",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get margined() {
    		throw new Error("<ServicesButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margined(value) {
    		throw new Error("<ServicesButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Grid.svelte generated by Svelte v3.59.2 */

    const file$j = "src/components/Grid.svelte";

    function create_fragment$k(ctx) {
    	let div8;
    	let div1;
    	let div0;
    	let t0;
    	let div4;
    	let div2;
    	let t1;
    	let div3;
    	let t2;
    	let div7;
    	let div5;
    	let t3;
    	let div6;
    	let t4;
    	let div9;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t1 = space();
    			div3 = element("div");
    			t2 = space();
    			div7 = element("div");
    			div5 = element("div");
    			t3 = space();
    			div6 = element("div");
    			t4 = space();
    			div9 = element("div");
    			set_style(div0, "background-image", "url('./images/factory/factory2.webp')");
    			attr_dev(div0, "class", "box svelte-1lh3j3");
    			add_location(div0, file$j, 11, 8, 87);
    			attr_dev(div1, "class", "grid svelte-1lh3j3");
    			add_location(div1, file$j, 10, 4, 60);
    			set_style(div2, "background-image", "url('./images/factory/factory1.webp')");
    			attr_dev(div2, "class", "box svelte-1lh3j3");
    			add_location(div2, file$j, 16, 8, 219);
    			set_style(div3, "background-image", "url('./images/factory/factory4.webp')");
    			attr_dev(div3, "class", "box svelte-1lh3j3");
    			add_location(div3, file$j, 17, 8, 315);
    			attr_dev(div4, "class", "grid svelte-1lh3j3");
    			add_location(div4, file$j, 15, 4, 192);
    			set_style(div5, "background-image", "url('./images/factory/factory3.webp')");
    			attr_dev(div5, "class", "box svelte-1lh3j3");
    			add_location(div5, file$j, 22, 8, 447);
    			set_style(div6, "background-image", "url('./images/factory/factory7.webp')");
    			attr_dev(div6, "class", "box svelte-1lh3j3");
    			add_location(div6, file$j, 23, 8, 543);
    			attr_dev(div7, "class", "grid svelte-1lh3j3");
    			add_location(div7, file$j, 21, 4, 420);
    			attr_dev(div8, "class", "grids_container svelte-1lh3j3");
    			add_location(div8, file$j, 8, 0, 25);
    			set_style(div9, "clear", "both");
    			add_location(div9, file$j, 28, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div1);
    			append_dev(div1, div0);
    			append_dev(div8, t0);
    			append_dev(div8, div4);
    			append_dev(div4, div2);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div9, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Grid', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/components/Landing.svelte generated by Svelte v3.59.2 */
    const file$i = "src/components/Landing.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let section;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let servicesbutton;
    	let t5;
    	let grid;
    	let current;

    	servicesbutton = new ServicesButton({
    			props: { margined: "true" },
    			$$inline: true
    		});

    	grid = new Grid({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			p0 = element("p");
    			p0.textContent = "Orsid Brothers Joint Venture With Juhak International";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Bridging Borders with Quality: ");
    			br = element("br");
    			t3 = text("Importing Essentials, Exporting Excellence.");
    			t4 = space();
    			create_component(servicesbutton.$$.fragment);
    			t5 = space();
    			create_component(grid.$$.fragment);
    			attr_dev(p0, "class", "effect_blur animate_blur svelte-6hzzyp");
    			add_location(p0, file$i, 35, 4, 686);
    			add_location(br, file$i, 37, 71, 852);
    			attr_dev(p1, "class", "effect_blur animate_blur svelte-6hzzyp");
    			add_location(p1, file$i, 37, 4, 785);
    			attr_dev(section, "id", "landing");
    			attr_dev(section, "class", "svelte-6hzzyp");
    			add_location(section, file$i, 34, 0, 659);
    			attr_dev(div, "class", "blocker");
    			add_location(div, file$i, 33, 0, 637);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			append_dev(section, p1);
    			append_dev(p1, t2);
    			append_dev(p1, br);
    			append_dev(p1, t3);
    			append_dev(section, t4);
    			mount_component(servicesbutton, section, null);
    			append_dev(section, t5);
    			mount_component(grid, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(servicesbutton.$$.fragment, local);
    			transition_in(grid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(servicesbutton.$$.fragment, local);
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(servicesbutton);
    			destroy_component(grid);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Landing', slots, []);
    	const observeElements = getContext('observeElements');
    	const unobserveElements = getContext('unobserveElements');

    	onMount(() => {
    		let elements = [];
    		elements.push(document.querySelector('section>p:first-of-type'));
    		elements.push(document.querySelector('section>p:last-of-type'));
    		observeElements(elements);
    		return () => unobserveElements(elements);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Landing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		NavStore,
    		ServicesButton,
    		Grid,
    		observeElements,
    		unobserveElements
    	});

    	return [];
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/components/About.svelte generated by Svelte v3.59.2 */

    const file$h = "src/components/About.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let section;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let br0;
    	let br1;
    	let t3;
    	let br2;
    	let br3;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			p0 = element("p");
    			p0.textContent = "Background";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Orsid Brothers Joint Venture With Juhak International is a trusted leader in the import and export industry, dedicated to connecting global markets with premium quality products. With years of experience in sourcing and distributing essential commodities, we specialize in importing food oil, rice, and sugar while exporting high-grade coffee, sesame, and kidney beans to markets worldwide.\n        ");
    			br0 = element("br");
    			br1 = element("br");
    			t3 = text("\n        Our commitment to quality, reliability, and excellence has established us as a preferred partner for businesses seeking sustainable and dependable supply chains. Leveraging our deep industry expertise and robust network, we ensure seamless operations and unmatched service, delivering value to our partners across continents.\n        ");
    			br2 = element("br");
    			br3 = element("br");
    			t4 = text("\n        We believe in fostering global connections while upholding ethical and sustainable practices, ensuring that every transaction contributes to a better future for our clients and communities.");
    			attr_dev(p0, "class", "svelte-lo4kpx");
    			add_location(p0, file$h, 7, 4, 69);
    			add_location(br0, file$h, 11, 8, 503);
    			add_location(br1, file$h, 11, 13, 508);
    			add_location(br2, file$h, 13, 8, 856);
    			add_location(br3, file$h, 13, 13, 861);
    			attr_dev(p1, "class", "svelte-lo4kpx");
    			add_location(p1, file$h, 9, 4, 92);
    			attr_dev(section, "id", "about");
    			attr_dev(section, "class", "svelte-lo4kpx");
    			add_location(section, file$h, 6, 0, 44);
    			attr_dev(div, "class", "blocker");
    			add_location(div, file$h, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			append_dev(section, p1);
    			append_dev(p1, t2);
    			append_dev(p1, br0);
    			append_dev(p1, br1);
    			append_dev(p1, t3);
    			append_dev(p1, br2);
    			append_dev(p1, br3);
    			append_dev(p1, t4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/components/Services.svelte generated by Svelte v3.59.2 */
    const file$g = "src/components/Services.svelte";

    function create_fragment$h(ctx) {
    	let div14;
    	let section;
    	let p0;
    	let t1;
    	let div6;
    	let p1;
    	let t3;
    	let a0;
    	let div1;
    	let div0;
    	let t4;
    	let p2;
    	let t6;
    	let a1;
    	let div3;
    	let div2;
    	let t7;
    	let p3;
    	let t9;
    	let a2;
    	let div5;
    	let div4;
    	let t10;
    	let p4;
    	let t12;
    	let div13;
    	let p5;
    	let t14;
    	let a3;
    	let div8;
    	let div7;
    	let t15;
    	let p6;
    	let t17;
    	let a4;
    	let div10;
    	let div9;
    	let t18;
    	let p7;
    	let t20;
    	let a5;
    	let div12;
    	let div11;
    	let t21;
    	let p8;

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			section = element("section");
    			p0 = element("p");
    			p0.textContent = "Services";
    			t1 = space();
    			div6 = element("div");
    			p1 = element("p");
    			p1.textContent = "Import Solutions";
    			t3 = space();
    			a0 = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Food Oil";
    			t6 = space();
    			a1 = element("a");
    			div3 = element("div");
    			div2 = element("div");
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Rice";
    			t9 = space();
    			a2 = element("a");
    			div5 = element("div");
    			div4 = element("div");
    			t10 = space();
    			p4 = element("p");
    			p4.textContent = "Sugar";
    			t12 = space();
    			div13 = element("div");
    			p5 = element("p");
    			p5.textContent = "Premium Export Services";
    			t14 = space();
    			a3 = element("a");
    			div8 = element("div");
    			div7 = element("div");
    			t15 = space();
    			p6 = element("p");
    			p6.textContent = "Coffee";
    			t17 = space();
    			a4 = element("a");
    			div10 = element("div");
    			div9 = element("div");
    			t18 = space();
    			p7 = element("p");
    			p7.textContent = "Sesame";
    			t20 = space();
    			a5 = element("a");
    			div12 = element("div");
    			div11 = element("div");
    			t21 = space();
    			p8 = element("p");
    			p8.textContent = "Kidney Beans";
    			attr_dev(p0, "class", "svelte-1uwnyre");
    			add_location(p0, file$g, 23, 4, 438);
    			attr_dev(p1, "class", "svelte-1uwnyre");
    			add_location(p1, file$g, 28, 8, 537);
    			set_style(div0, "background-image", "url('./images/oil/oil1.webp')");
    			attr_dev(div0, "class", "service_pic img svelte-1uwnyre");
    			add_location(div0, file$g, 33, 16, 674);
    			attr_dev(p2, "class", "svelte-1uwnyre");
    			add_location(p2, file$g, 35, 16, 783);
    			attr_dev(div1, "class", "effect_shrink animate_shrink service_content svelte-1uwnyre");
    			add_location(div1, file$g, 31, 12, 598);
    			attr_dev(a0, "href", "/oil");
    			attr_dev(a0, "class", "svelte-1uwnyre");
    			add_location(a0, file$g, 30, 8, 570);
    			set_style(div2, "background-image", "url('./images/rice/rice1.webp')");
    			attr_dev(div2, "class", "service_pic img svelte-1uwnyre");
    			add_location(div2, file$g, 43, 12, 938);
    			attr_dev(p3, "class", "svelte-1uwnyre");
    			add_location(p3, file$g, 45, 12, 1045);
    			attr_dev(div3, "class", "effect_shrink animate_shrink service_content svelte-1uwnyre");
    			add_location(div3, file$g, 41, 8, 866);
    			attr_dev(a1, "href", "/rice");
    			attr_dev(a1, "class", "svelte-1uwnyre");
    			add_location(a1, file$g, 40, 8, 841);
    			set_style(div4, "background-image", "url('./images/sugar/sugar1.webp')");
    			attr_dev(div4, "class", "service_pic img svelte-1uwnyre");
    			add_location(div4, file$g, 53, 12, 1193);
    			attr_dev(p4, "class", "svelte-1uwnyre");
    			add_location(p4, file$g, 55, 12, 1302);
    			attr_dev(div5, "class", "effect_shrink animate_shrink service_content svelte-1uwnyre");
    			add_location(div5, file$g, 51, 8, 1121);
    			attr_dev(a2, "href", "/sugar");
    			attr_dev(a2, "class", "svelte-1uwnyre");
    			add_location(a2, file$g, 50, 8, 1095);
    			attr_dev(div6, "class", "service_container svelte-1uwnyre");
    			add_location(div6, file$g, 26, 4, 496);
    			attr_dev(p5, "class", "svelte-1uwnyre");
    			add_location(p5, file$g, 68, 8, 1450);
    			set_style(div7, "background-image", "url('./images/coffee/coffee1.webp')");
    			attr_dev(div7, "class", "service_pic img svelte-1uwnyre");
    			add_location(div7, file$g, 73, 12, 1589);
    			attr_dev(p6, "class", "svelte-1uwnyre");
    			add_location(p6, file$g, 75, 12, 1700);
    			attr_dev(div8, "class", "effect_shrink animate_shrink service_content svelte-1uwnyre");
    			add_location(div8, file$g, 71, 8, 1517);
    			attr_dev(a3, "href", "/coffee");
    			attr_dev(a3, "class", "svelte-1uwnyre");
    			add_location(a3, file$g, 70, 8, 1490);
    			set_style(div9, "background-image", "url('./images/sesame/sesame1.webp')");
    			attr_dev(div9, "class", "service_pic img svelte-1uwnyre");
    			add_location(div9, file$g, 83, 12, 1859);
    			attr_dev(p7, "class", "svelte-1uwnyre");
    			add_location(p7, file$g, 85, 12, 1970);
    			attr_dev(div10, "class", "effect_shrink animate_shrink service_content svelte-1uwnyre");
    			add_location(div10, file$g, 81, 8, 1787);
    			attr_dev(a4, "href", "/sesame");
    			attr_dev(a4, "class", "svelte-1uwnyre");
    			add_location(a4, file$g, 80, 8, 1760);
    			set_style(div11, "background-image", "url('./images/beans/beans1.webp')");
    			attr_dev(div11, "class", "service_pic img svelte-1uwnyre");
    			add_location(div11, file$g, 93, 12, 2136);
    			attr_dev(p8, "class", "svelte-1uwnyre");
    			add_location(p8, file$g, 95, 12, 2245);
    			attr_dev(div12, "class", "effect_shrink animate_shrink service_content svelte-1uwnyre");
    			add_location(div12, file$g, 91, 8, 2064);
    			attr_dev(a5, "href", "/beans");
    			attr_dev(a5, "class", "svelte-1uwnyre");
    			add_location(a5, file$g, 90, 8, 2038);
    			attr_dev(div13, "class", "service_container svelte-1uwnyre");
    			add_location(div13, file$g, 66, 4, 1409);
    			attr_dev(section, "id", "services");
    			attr_dev(section, "class", "svelte-1uwnyre");
    			add_location(section, file$g, 21, 0, 409);
    			attr_dev(div14, "class", "blocker");
    			add_location(div14, file$g, 20, 0, 387);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, section);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			append_dev(section, div6);
    			append_dev(div6, p1);
    			append_dev(div6, t3);
    			append_dev(div6, a0);
    			append_dev(a0, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t4);
    			append_dev(div1, p2);
    			append_dev(div6, t6);
    			append_dev(div6, a1);
    			append_dev(a1, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t7);
    			append_dev(div3, p3);
    			append_dev(div6, t9);
    			append_dev(div6, a2);
    			append_dev(a2, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t10);
    			append_dev(div5, p4);
    			append_dev(section, t12);
    			append_dev(section, div13);
    			append_dev(div13, p5);
    			append_dev(div13, t14);
    			append_dev(div13, a3);
    			append_dev(a3, div8);
    			append_dev(div8, div7);
    			append_dev(div8, t15);
    			append_dev(div8, p6);
    			append_dev(div13, t17);
    			append_dev(div13, a4);
    			append_dev(a4, div10);
    			append_dev(div10, div9);
    			append_dev(div10, t18);
    			append_dev(div10, p7);
    			append_dev(div13, t20);
    			append_dev(div13, a5);
    			append_dev(a5, div12);
    			append_dev(div12, div11);
    			append_dev(div12, t21);
    			append_dev(div12, p8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	const observeElements = getContext('observeElements');
    	const unobserveElements = getContext('unobserveElements');

    	onMount(() => {
    		let elements = [...document.querySelectorAll('.service_content')];
    		observeElements(elements);
    		return () => unobserveElements(elements);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		observeElements,
    		unobserveElements
    	});

    	return [];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/Vision.svelte generated by Svelte v3.59.2 */
    const file$f = "src/components/Vision.svelte";

    // (50:8) {#if $OtherStates.split}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line svelte-mrlasw");
    			add_location(div, file$f, 50, 12, 1569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(50:8) {#if $OtherStates.split}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div5;
    	let section;
    	let div4;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let p1;
    	let t3;
    	let br0;
    	let t4;
    	let t5;
    	let p2;
    	let t7;
    	let t8;
    	let div3;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let p3;
    	let t11;
    	let p4;
    	let t12;
    	let br1;
    	let t13;
    	let t14;
    	let p5;
    	let if_block = /*$OtherStates*/ ctx[0].split && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			section = element("section");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Vision";
    			t2 = space();
    			p1 = element("p");
    			t3 = text("Connecting Global Markets with  ");
    			br0 = element("br");
    			t4 = text("Quality and Reliability");
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Our vision is to become the trusted leader in the import and export of essential commodities, serving as a vital link between producers and consumers across the globe. We aspire to be recognized for our dedication to quality, ethical practices, and commitment to fostering sustainable trade relationships that benefit all stakeholders.";
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			div3 = element("div");
    			div2 = element("div");
    			img1 = element("img");
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "Mission";
    			t11 = space();
    			p4 = element("p");
    			t12 = text("Delivering Premium Commodities with  ");
    			br1 = element("br");
    			t13 = text("Excellence and Integrity");
    			t14 = space();
    			p5 = element("p");
    			p5.textContent = "Our mission is to provide high-quality food oil, rice, and sugar to global markets while showcasing the richness of our exports, including coffee, sesame, and kidney beans. Through efficient supply chains, meticulous quality assurance, and customer-centric service, we strive to meet the diverse needs of our partners. By upholding the highest standards of professionalism and trust, we aim to build lasting relationships that drive mutual growth and success.";
    			attr_dev(img0, "class", "effect_open animate_open eye_image svelte-mrlasw");
    			if (!src_url_equal(img0.src, img0_src_value = "images/eye.svg")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$f, 39, 16, 866);
    			attr_dev(p0, "class", "svelte-mrlasw");
    			add_location(p0, file$f, 40, 16, 953);
    			attr_dev(div0, "class", "svelte-mrlasw");
    			add_location(div0, file$f, 38, 12, 844);
    			attr_dev(br0, "class", "svelte-mrlasw");
    			add_location(br0, file$f, 43, 77, 1076);
    			attr_dev(p1, "class", "effect_up animate_up1 svelte-mrlasw");
    			add_location(p1, file$f, 43, 12, 1011);
    			attr_dev(p2, "class", "effect_up animate_up2 svelte-mrlasw");
    			add_location(p2, file$f, 45, 12, 1122);
    			attr_dev(div1, "class", "block svelte-mrlasw");
    			add_location(div1, file$f, 36, 8, 811);
    			attr_dev(img1, "class", "effect_rotate animate_rotate gear_image svelte-mrlasw");
    			if (!src_url_equal(img1.src, img1_src_value = "images/gear.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$f, 57, 16, 1673);
    			attr_dev(p3, "class", "svelte-mrlasw");
    			add_location(p3, file$f, 58, 16, 1766);
    			attr_dev(div2, "class", "svelte-mrlasw");
    			add_location(div2, file$f, 56, 12, 1651);
    			attr_dev(br1, "class", "svelte-mrlasw");
    			add_location(br1, file$f, 61, 82, 1883);
    			attr_dev(p4, "class", "effect_up animate_up1 svelte-mrlasw");
    			add_location(p4, file$f, 61, 12, 1813);
    			attr_dev(p5, "class", "effect_up animate_up2 svelte-mrlasw");
    			add_location(p5, file$f, 63, 12, 1930);
    			attr_dev(div3, "class", "block svelte-mrlasw");
    			add_location(div3, file$f, 54, 8, 1618);
    			attr_dev(div4, "class", "vision_block_container svelte-mrlasw");
    			add_location(div4, file$f, 34, 4, 765);
    			attr_dev(section, "id", "vision");
    			attr_dev(section, "class", "svelte-mrlasw");
    			add_location(section, file$f, 32, 0, 738);
    			attr_dev(div5, "class", "blocker");
    			add_location(div5, file$f, 31, 0, 716);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, section);
    			append_dev(section, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(p1, t3);
    			append_dev(p1, br0);
    			append_dev(p1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			append_dev(div4, t7);
    			if (if_block) if_block.m(div4, null);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t9);
    			append_dev(div2, p3);
    			append_dev(div3, t11);
    			append_dev(div3, p4);
    			append_dev(p4, t12);
    			append_dev(p4, br1);
    			append_dev(p4, t13);
    			append_dev(div3, t14);
    			append_dev(div3, p5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$OtherStates*/ ctx[0].split) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div4, t8);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $OtherStates;
    	validate_store(OtherStates, 'OtherStates');
    	component_subscribe($$self, OtherStates, $$value => $$invalidate(0, $OtherStates = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Vision', slots, []);
    	const observeElements = getContext('observeElements');
    	const unobserveElements = getContext('unobserveElements');

    	onMount(() => {
    		let elements = [];
    		elements.push(document.querySelector('.eye_image'));
    		elements.push(document.querySelector('.gear_image'));
    		const first = document.querySelectorAll('.block>p:first-of-type');
    		const last = document.querySelectorAll('.block>p:last-of-type');
    		elements = [...elements, ...first, ...last];
    		observeElements(elements);
    		return () => unobserveElements(elements);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Vision> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		OtherStates,
    		observeElements,
    		unobserveElements,
    		$OtherStates
    	});

    	return [$OtherStates];
    }

    class Vision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vision",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/Team.svelte generated by Svelte v3.59.2 */
    const file$e = "src/components/Team.svelte";

    function create_fragment$f(ctx) {
    	let div10;
    	let section;
    	let p0;
    	let t1;
    	let div9;
    	let p1;
    	let t2;
    	let br0;
    	let br1;
    	let t3;
    	let t4;
    	let div8;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let div0;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let div2;
    	let p4;
    	let t12;
    	let p5;
    	let t14;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t15;
    	let div4;
    	let p6;
    	let t17;
    	let p7;
    	let t19;
    	let div7;
    	let img3;
    	let img3_src_value;
    	let t20;
    	let div6;
    	let p8;
    	let t22;
    	let p9;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			section = element("section");
    			p0 = element("p");
    			p0.textContent = "Team";
    			t1 = space();
    			div9 = element("div");
    			p1 = element("p");
    			t2 = text("The backbone of our success is our passionate and highly skilled team, composed of experienced professionals and visionary management with deep expertise in the import and export industry. Supported by a network of dedicated specialists, we bring exceptional value and reliability to our clients around the globe.\n            ");
    			br0 = element("br");
    			br1 = element("br");
    			t3 = text("\n            Our team is united by a shared commitment to excellence, integrity, and innovation. We thrive on collaboration and problem-solving, ensuring that every project is handled with precision and care. Together, we deliver outstanding results, fostering trust and long-term partnerships with our clients and stakeholders.");
    			t4 = space();
    			div8 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t5 = space();
    			div0 = element("div");
    			p2 = element("p");
    			p2.textContent = "Supply Chain Specialists";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Streamlining the procurement and delivery process to ensure timely and efficient movement of goods across borders, while maintaining top-quality standards.";
    			t9 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t10 = space();
    			div2 = element("div");
    			p4 = element("p");
    			p4.textContent = "Quality Assurance Experts";
    			t12 = space();
    			p5 = element("p");
    			p5.textContent = "Overseeing product inspections and certifications to guarantee that all imported and exported commodities meet international quality and safety standards.";
    			t14 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t15 = space();
    			div4 = element("div");
    			p6 = element("p");
    			p6.textContent = "Logistics Coordinators";
    			t17 = space();
    			p7 = element("p");
    			p7.textContent = "Managing transportation, customs clearance, and warehousing to ensure seamless operations and on-time delivery of goods to clients worldwide.";
    			t19 = space();
    			div7 = element("div");
    			img3 = element("img");
    			t20 = space();
    			div6 = element("div");
    			p8 = element("p");
    			p8.textContent = "Market Analysts";
    			t22 = space();
    			p9 = element("p");
    			p9.textContent = "Researching global market trends and opportunities to optimize trade strategies and meet the evolving demands of customers and partners.";
    			attr_dev(p0, "class", "svelte-19y5clo");
    			add_location(p0, file$e, 23, 4, 422);
    			add_location(br0, file$e, 28, 12, 832);
    			add_location(br1, file$e, 28, 17, 837);
    			attr_dev(p1, "class", "team_writing svelte-19y5clo");
    			add_location(p1, file$e, 26, 8, 469);
    			if (!src_url_equal(img0.src, img0_src_value = "images/mechanical.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "svelte-19y5clo");
    			add_location(img0, file$e, 36, 16, 1297);
    			attr_dev(p2, "class", "svelte-19y5clo");
    			add_location(p2, file$e, 39, 20, 1393);
    			attr_dev(p3, "class", "svelte-19y5clo");
    			add_location(p3, file$e, 41, 20, 1446);
    			attr_dev(div0, "class", "way_text svelte-19y5clo");
    			add_location(div0, file$e, 38, 16, 1350);
    			attr_dev(div1, "class", "effect_right animate_right way svelte-19y5clo");
    			add_location(div1, file$e, 34, 12, 1235);
    			if (!src_url_equal(img1.src, img1_src_value = "images/technician.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "svelte-19y5clo");
    			add_location(img1, file$e, 49, 16, 1728);
    			attr_dev(p4, "class", "svelte-19y5clo");
    			add_location(p4, file$e, 52, 20, 1824);
    			attr_dev(p5, "class", "svelte-19y5clo");
    			add_location(p5, file$e, 54, 20, 1878);
    			attr_dev(div2, "class", "way_text svelte-19y5clo");
    			add_location(div2, file$e, 51, 16, 1781);
    			attr_dev(div3, "class", "effect_right animate_right way svelte-19y5clo");
    			add_location(div3, file$e, 47, 12, 1666);
    			if (!src_url_equal(img2.src, img2_src_value = "images/administrator.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-19y5clo");
    			add_location(img2, file$e, 62, 16, 2161);
    			attr_dev(p6, "class", "svelte-19y5clo");
    			add_location(p6, file$e, 65, 20, 2260);
    			attr_dev(p7, "class", "svelte-19y5clo");
    			add_location(p7, file$e, 67, 20, 2311);
    			attr_dev(div4, "class", "way_text svelte-19y5clo");
    			add_location(div4, file$e, 64, 16, 2217);
    			attr_dev(div5, "class", "effect_right animate_right way svelte-19y5clo");
    			add_location(div5, file$e, 60, 12, 2099);
    			if (!src_url_equal(img3.src, img3_src_value = "images/electrical.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "svelte-19y5clo");
    			add_location(img3, file$e, 75, 16, 2581);
    			attr_dev(p8, "class", "svelte-19y5clo");
    			add_location(p8, file$e, 78, 20, 2677);
    			attr_dev(p9, "class", "svelte-19y5clo");
    			add_location(p9, file$e, 80, 20, 2721);
    			attr_dev(div6, "class", "way_text svelte-19y5clo");
    			add_location(div6, file$e, 77, 16, 2634);
    			attr_dev(div7, "class", "effect_right animate_right way svelte-19y5clo");
    			add_location(div7, file$e, 73, 12, 2519);
    			attr_dev(div8, "class", "ways_container svelte-19y5clo");
    			add_location(div8, file$e, 32, 8, 1193);
    			attr_dev(div9, "class", "teaming svelte-19y5clo");
    			add_location(div9, file$e, 25, 4, 439);
    			attr_dev(section, "id", "team");
    			attr_dev(section, "class", "svelte-19y5clo");
    			add_location(section, file$e, 21, 0, 397);
    			attr_dev(div10, "class", "blocker");
    			add_location(div10, file$e, 20, 0, 375);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, section);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			append_dev(section, div9);
    			append_dev(div9, p1);
    			append_dev(p1, t2);
    			append_dev(p1, br0);
    			append_dev(p1, br1);
    			append_dev(p1, t3);
    			append_dev(div9, t4);
    			append_dev(div9, div8);
    			append_dev(div8, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, p2);
    			append_dev(div0, t7);
    			append_dev(div0, p3);
    			append_dev(div8, t9);
    			append_dev(div8, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, p4);
    			append_dev(div2, t12);
    			append_dev(div2, p5);
    			append_dev(div8, t14);
    			append_dev(div8, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t15);
    			append_dev(div5, div4);
    			append_dev(div4, p6);
    			append_dev(div4, t17);
    			append_dev(div4, p7);
    			append_dev(div8, t19);
    			append_dev(div8, div7);
    			append_dev(div7, img3);
    			append_dev(div7, t20);
    			append_dev(div7, div6);
    			append_dev(div6, p8);
    			append_dev(div6, t22);
    			append_dev(div6, p9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	const observeElements = getContext('observeElements');
    	const unobserveElements = getContext('unobserveElements');

    	onMount(() => {
    		let elements = [...document.querySelectorAll('.way')];
    		observeElements(elements);
    		return () => unobserveElements(elements);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		observeElements,
    		unobserveElements
    	});

    	return [];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/ContactForm.svelte generated by Svelte v3.59.2 */
    const file$d = "src/components/ContactForm.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let p;
    	let t1;
    	let form;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let input2;
    	let t4;
    	let textarea;
    	let t5;
    	let input3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Get in Touch";
    			t1 = space();
    			form = element("form");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			textarea = element("textarea");
    			t5 = space();
    			input3 = element("input");
    			attr_dev(p, "class", "svelte-10y1zuh");
    			add_location(p, file$d, 19, 4, 369);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Name");
    			attr_dev(input0, "name", "Name");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-10y1zuh");
    			add_location(input0, file$d, 23, 8, 434);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "Email");
    			attr_dev(input1, "name", "Email");
    			input1.required = true;
    			attr_dev(input1, "class", "svelte-10y1zuh");
    			add_location(input1, file$d, 24, 8, 504);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Subject");
    			attr_dev(input2, "name", "Subject");
    			input2.required = true;
    			attr_dev(input2, "class", "svelte-10y1zuh");
    			add_location(input2, file$d, 25, 8, 577);
    			attr_dev(textarea, "placeholder", "Message");
    			attr_dev(textarea, "name", "Message");
    			textarea.required = true;
    			attr_dev(textarea, "class", "svelte-10y1zuh");
    			add_location(textarea, file$d, 26, 8, 653);
    			attr_dev(input3, "class", "effect_wide animate_wide svelte-10y1zuh");
    			attr_dev(input3, "type", "submit");
    			input3.value = "Submit";
    			add_location(input3, file$d, 28, 8, 730);
    			attr_dev(form, "action", "");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "svelte-10y1zuh");
    			add_location(form, file$d, 21, 4, 394);
    			attr_dev(div, "class", "form_container svelte-10y1zuh");
    			add_location(div, file$d, 17, 0, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, form);
    			append_dev(form, input0);
    			append_dev(form, t2);
    			append_dev(form, input1);
    			append_dev(form, t3);
    			append_dev(form, input2);
    			append_dev(form, t4);
    			append_dev(form, textarea);
    			append_dev(form, t5);
    			append_dev(form, input3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContactForm', slots, []);
    	const observer = getContext('observer');
    	let observeding;

    	onMount(() => {
    		observeding = document.querySelector("form>input[type='submit']");
    		observer.observe(observeding);
    		return () => observer.unobserve(observeding);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContactForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		observer,
    		observeding
    	});

    	$$self.$inject_state = $$props => {
    		if ('observeding' in $$props) observeding = $$props.observeding;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactForm",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/Contact.svelte generated by Svelte v3.59.2 */
    const file$c = "src/components/Contact.svelte";

    function create_fragment$d(ctx) {
    	let div5;
    	let section;
    	let div4;
    	let div3;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let div2;
    	let div1;
    	let div0;
    	let t7;
    	let p3;
    	let t9;
    	let p4;
    	let t11;
    	let p5;
    	let t13;
    	let p6;
    	let t15;
    	let p7;
    	let t17;
    	let contactform;
    	let t18;
    	let h6;
    	let t19;
    	let br;
    	let t20;
    	let current;
    	contactform = new ContactForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			section = element("section");
    			div4 = element("div");
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "Contact Us";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Reach out to us to learn how we can streamline your access to high-quality imports or partner with you to share exceptional exports with the world.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "E-MAIL: orsidjuhak@gmail.com";
    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Ethiopia Branch";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Mob: +251 911 30 20 03";
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "Mob: +251 911 86 25 26";
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "Lebu Mebrat";
    			t13 = space();
    			p6 = element("p");
    			p6.textContent = "Ye Heben Getseta Bldg";
    			t15 = space();
    			p7 = element("p");
    			p7.textContent = "Addis Ababa, Ethiopia";
    			t17 = space();
    			create_component(contactform.$$.fragment);
    			t18 = space();
    			h6 = element("h6");
    			t19 = text("© 2025 Orsid_Juhak.");
    			br = element("br");
    			t20 = text("All Rights Reserved.");
    			attr_dev(p0, "class", "svelte-1vfje61");
    			add_location(p0, file$c, 12, 12, 201);
    			attr_dev(p1, "class", "svelte-1vfje61");
    			add_location(p1, file$c, 14, 12, 232);
    			attr_dev(p2, "class", "svelte-1vfje61");
    			add_location(p2, file$c, 16, 12, 400);
    			attr_dev(div0, "class", "svelte-1vfje61");
    			add_location(div0, file$c, 21, 20, 529);
    			attr_dev(p3, "class", "svelte-1vfje61");
    			add_location(p3, file$c, 23, 20, 577);
    			attr_dev(p4, "class", "svelte-1vfje61");
    			add_location(p4, file$c, 24, 20, 627);
    			attr_dev(p5, "class", "svelte-1vfje61");
    			add_location(p5, file$c, 25, 20, 677);
    			attr_dev(p6, "class", "svelte-1vfje61");
    			add_location(p6, file$c, 26, 20, 716);
    			attr_dev(p7, "class", "svelte-1vfje61");
    			add_location(p7, file$c, 27, 20, 765);
    			attr_dev(div1, "class", "info svelte-1vfje61");
    			add_location(div1, file$c, 20, 16, 490);
    			attr_dev(div2, "class", "infos_div svelte-1vfje61");
    			add_location(div2, file$c, 18, 12, 449);
    			attr_dev(div3, "class", "contact_left svelte-1vfje61");
    			add_location(div3, file$c, 11, 8, 162);
    			attr_dev(div4, "class", "contact_toper svelte-1vfje61");
    			add_location(div4, file$c, 10, 4, 126);
    			add_location(br, file$c, 39, 27, 923);
    			attr_dev(h6, "class", "svelte-1vfje61");
    			add_location(h6, file$c, 39, 4, 900);
    			attr_dev(section, "id", "contact");
    			attr_dev(section, "class", "svelte-1vfje61");
    			add_location(section, file$c, 8, 0, 98);
    			attr_dev(div5, "class", "blocker2");
    			add_location(div5, file$c, 7, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, section);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, p0);
    			append_dev(div3, t1);
    			append_dev(div3, p1);
    			append_dev(div3, t3);
    			append_dev(div3, p2);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t7);
    			append_dev(div1, p3);
    			append_dev(div1, t9);
    			append_dev(div1, p4);
    			append_dev(div1, t11);
    			append_dev(div1, p5);
    			append_dev(div1, t13);
    			append_dev(div1, p6);
    			append_dev(div1, t15);
    			append_dev(div1, p7);
    			append_dev(div4, t17);
    			mount_component(contactform, div4, null);
    			append_dev(section, t18);
    			append_dev(section, h6);
    			append_dev(h6, t19);
    			append_dev(h6, br);
    			append_dev(h6, t20);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(contactform);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ContactForm });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Home.svelte generated by Svelte v3.59.2 */
    const file$b = "src/Home.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let nav;
    	let t0;
    	let landing;
    	let t1;
    	let about;
    	let t2;
    	let services;
    	let t3;
    	let vision;
    	let t4;
    	let team;
    	let t5;
    	let contact;
    	let current;
    	nav = new Nav({ $$inline: true });
    	landing = new Landing({ $$inline: true });
    	about = new About({ $$inline: true });
    	services = new Services({ $$inline: true });
    	vision = new Vision({ $$inline: true });
    	team = new Team({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(landing.$$.fragment);
    			t1 = space();
    			create_component(about.$$.fragment);
    			t2 = space();
    			create_component(services.$$.fragment);
    			t3 = space();
    			create_component(vision.$$.fragment);
    			t4 = space();
    			create_component(team.$$.fragment);
    			t5 = space();
    			create_component(contact.$$.fragment);
    			attr_dev(div, "id", "container");
    			add_location(div, file$b, 154, 0, 3090);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(nav, div, null);
    			append_dev(div, t0);
    			mount_component(landing, div, null);
    			append_dev(div, t1);
    			mount_component(about, div, null);
    			append_dev(div, t2);
    			mount_component(services, div, null);
    			append_dev(div, t3);
    			mount_component(vision, div, null);
    			append_dev(div, t4);
    			mount_component(team, div, null);
    			append_dev(div, t5);
    			mount_component(contact, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(landing.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(vision.$$.fragment, local);
    			transition_in(team.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(landing.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(vision.$$.fragment, local);
    			transition_out(team.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(nav);
    			destroy_component(landing);
    			destroy_component(about);
    			destroy_component(services);
    			destroy_component(vision);
    			destroy_component(team);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);

    	const nav_observer = new IntersectionObserver(entries => {
    			entries.forEach(entry => {
    				if (entry.isIntersecting) {
    					const classes = Array.from(entry.target.classList);
    					entry.target.classList.remove(classes[0]);
    					observer.unobserve(entry.target);
    				}
    			});
    		},
    	{ rootMargin: '0px', threshold: 0 });

    	const observer = new IntersectionObserver(entries => {
    			entries.forEach(entry => {
    				if (entry.isIntersecting) {
    					const classes = Array.from(entry.target.classList);
    					entry.target.classList.remove(classes[0]);
    					observer.unobserve(entry.target);
    				}
    			});
    		},
    	{ rootMargin: '-20px', threshold: 0 });

    	const parent_observer = new IntersectionObserver(entries => {
    			entries.forEach(entry => {
    				if (entry.isIntersecting) {
    					const elements = Array.from(entry.target.children);

    					elements.forEach(element => {
    						const classes = Array.from(element.classList);
    						element.classList.remove(classes[0]);
    					});

    					observer.unobserve(entry.target);
    				}
    			});
    		},
    	{ rootMargin: '-20px', threshold: 0 });

    	function observeElements(elements) {
    		elements.forEach(element => {
    			observer.observe(element);
    		});
    	}

    	function unobserveElements(elements) {
    		elements.forEach(element => {
    			observer.unobserve(element);
    		});
    	}

    	setContext('nav_observer', nav_observer);
    	setContext('observer', observer);
    	setContext('parent_observer', parent_observer);
    	setContext('observeElements', observeElements);
    	setContext('unobserveElements', unobserveElements);

    	function resize_handler() {
    		let width = window.innerWidth;

    		ServicesState.update(current_state => {
    			return { ...current_state };
    		});

    		if (width >= 771) {
    			NavStore.update(current_state => {
    				return { ...current_state, "wide": true };
    			});
    		} else {
    			NavStore.update(current_state => {
    				return { ...current_state, "wide": false };
    			});
    		}

    		if (width >= 995) {
    			OtherStates.update(current_state => {
    				return { ...current_state, "split": true };
    			});
    		} else {
    			OtherStates.update(current_state => {
    				return { ...current_state, "split": false };
    			});
    		}
    	}

    	onMount(() => {
    		resize_handler();
    		window.addEventListener("resize", resize_handler);
    	});

    	onDestroy(() => {
    		window.removeEventListener("resize", resize_handler);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		setContext,
    		NavStore,
    		OtherStates,
    		ServicesState,
    		Nav,
    		Landing,
    		About,
    		Services,
    		Vision,
    		Team,
    		Contact,
    		nav_observer,
    		observer,
    		parent_observer,
    		observeElements,
    		unobserveElements,
    		resize_handler
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/sub_components/Top.svelte generated by Svelte v3.59.2 */

    const file$a = "src/components/sub_components/Top.svelte";

    function create_fragment$b(ctx) {
    	let nav;
    	let a;
    	let p;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a = element("a");
    			p = element("p");
    			p.textContent = "Orsid Juhak";
    			attr_dev(p, "class", "name svelte-64i9gr");
    			add_location(p, file$a, 7, 16, 45);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-64i9gr");
    			add_location(a, file$a, 7, 4, 33);
    			attr_dev(nav, "class", "svelte-64i9gr");
    			add_location(nav, file$a, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a);
    			append_dev(a, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Top', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Top> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Top extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Top",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/sub_components/Back.svelte generated by Svelte v3.59.2 */

    const file$9 = "src/components/sub_components/Back.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let a;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			p = element("p");
    			p.textContent = "Back Home";
    			attr_dev(p, "class", "svelte-9ufqsl");
    			add_location(p, file$9, 6, 16, 44);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-9ufqsl");
    			add_location(a, file$9, 6, 4, 32);
    			attr_dev(div, "class", "svelte-9ufqsl");
    			add_location(div, file$9, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Back', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Back> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Back extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Back",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/sub_components/Title.svelte generated by Svelte v3.59.2 */

    const file$8 = "src/components/sub_components/Title.svelte";

    function create_fragment$9(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(p, "class", "svelte-6yez5t");
    			add_location(p, file$8, 4, 0, 41);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let { name } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<Title> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get name() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/sub_components/Description.svelte generated by Svelte v3.59.2 */

    const file$7 = "src/components/sub_components/Description.svelte";

    function create_fragment$8(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*descript*/ ctx[0]);
    			attr_dev(p, "class", "svelte-16fyp0a");
    			add_location(p, file$7, 5, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*descript*/ 1) set_data_dev(t, /*descript*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Description', slots, []);
    	let { descript } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (descript === undefined && !('descript' in $$props || $$self.$$.bound[$$self.$$.props['descript']])) {
    			console.warn("<Description> was created without expected prop 'descript'");
    		}
    	});

    	const writable_props = ['descript'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Description> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('descript' in $$props) $$invalidate(0, descript = $$props.descript);
    	};

    	$$self.$capture_state = () => ({ descript });

    	$$self.$inject_state = $$props => {
    		if ('descript' in $$props) $$invalidate(0, descript = $$props.descript);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [descript];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { descript: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get descript() {
    		throw new Error("<Description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set descript(value) {
    		throw new Error("<Description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/sub_components/Pictures.svelte generated by Svelte v3.59.2 */

    const file$6 = "src/components/sub_components/Pictures.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:8) {#each images as image}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;
    	let t1_value = /*image*/ ctx[1].title + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			set_style(div0, "background-image", "url(" + /*image*/ ctx[1].address + ")");
    			attr_dev(div0, "class", "image svelte-u5wdin");
    			add_location(div0, file$6, 14, 16, 174);
    			attr_dev(p, "class", "img_title svelte-u5wdin");
    			add_location(p, file$6, 15, 16, 263);
    			attr_dev(div1, "class", "pic svelte-u5wdin");
    			add_location(div1, file$6, 13, 12, 140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 1) {
    				set_style(div0, "background-image", "url(" + /*image*/ ctx[1].address + ")");
    			}

    			if (dirty & /*images*/ 1 && t1_value !== (t1_value = /*image*/ ctx[1].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:8) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_value = /*images*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pics_container svelte-u5wdin");
    			add_location(div, file$6, 8, 4, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images*/ 1) {
    				each_value = /*images*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pictures', slots, []);
    	let { images = [] } = $$props;
    	const writable_props = ['images'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pictures> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('images' in $$props) $$invalidate(0, images = $$props.images);
    	};

    	$$self.$capture_state = () => ({ images });

    	$$self.$inject_state = $$props => {
    		if ('images' in $$props) $$invalidate(0, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [images];
    }

    class Pictures extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { images: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pictures",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get images() {
    		throw new Error("<Pictures>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Pictures>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Air.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/Air.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let top;
    	let t0;
    	let back;
    	let t1;
    	let title;
    	let t2;
    	let description;
    	let t3;
    	let pictures;
    	let current;
    	top = new Top({ $$inline: true });
    	back = new Back({ $$inline: true });

    	title = new Title({
    			props: { name: "Food Oil Importing" },
    			$$inline: true
    		});

    	description = new Description({
    			props: {
    				descript: "Experience the finest in edible oil imports with premium, high-quality products sourced from trusted global suppliers. Perfect for both businesses and consumers, our oils are selected for their purity, taste, and adherence to international standards. Ensure consistency in your kitchen or business with reliable supply, exceptional quality, and a commitment to meeting your needs. Upgrade your culinary creations with oils crafted for excellence."
    			},
    			$$inline: true
    		});

    	pictures = new Pictures({
    			props: { images: /*imgs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(back.$$.fragment);
    			t1 = space();
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(description.$$.fragment);
    			t3 = space();
    			create_component(pictures.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1lxivbz");
    			add_location(div, file$5, 24, 0, 625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(top, div, null);
    			append_dev(div, t0);
    			mount_component(back, div, null);
    			append_dev(div, t1);
    			mount_component(title, div, null);
    			append_dev(div, t2);
    			mount_component(description, div, null);
    			append_dev(div, t3);
    			mount_component(pictures, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(back.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(pictures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(back.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(pictures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(top);
    			destroy_component(back);
    			destroy_component(title);
    			destroy_component(description);
    			destroy_component(pictures);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Air', slots, []);

    	let imgs = [
    		{
    			"title": "Premium Edible Oil",
    			"address": "../images/oil/oil1.webp"
    		},
    		{
    			"title": "Pure & Quality Food Oil",
    			"address": "../images/oil/oil2.webp"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Air> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Top,
    		Back,
    		Title,
    		Description,
    		Pictures,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('imgs' in $$props) $$invalidate(0, imgs = $$props.imgs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgs];
    }

    class Air extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Air",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Pump.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/Pump.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let top;
    	let t0;
    	let back;
    	let t1;
    	let title;
    	let t2;
    	let description;
    	let t3;
    	let pictures;
    	let current;
    	top = new Top({ $$inline: true });
    	back = new Back({ $$inline: true });

    	title = new Title({
    			props: { name: "Rice Importing" },
    			$$inline: true
    		});

    	description = new Description({
    			props: {
    				descript: "Discover premium rice varieties imported from trusted global producers, carefully selected to meet diverse culinary needs. Whether for households, restaurants, or large-scale businesses, our rice is known for its quality, flavor, and consistency. Rely on us for a dependable supply that ensures your dishes always meet the highest standards."
    			},
    			$$inline: true
    		});

    	pictures = new Pictures({
    			props: { images: /*imgs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(back.$$.fragment);
    			t1 = space();
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(description.$$.fragment);
    			t3 = space();
    			create_component(pictures.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1lxivbz");
    			add_location(div, file$4, 28, 0, 734);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(top, div, null);
    			append_dev(div, t0);
    			mount_component(back, div, null);
    			append_dev(div, t1);
    			mount_component(title, div, null);
    			append_dev(div, t2);
    			mount_component(description, div, null);
    			append_dev(div, t3);
    			mount_component(pictures, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(back.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(pictures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(back.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(pictures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(top);
    			destroy_component(back);
    			destroy_component(title);
    			destroy_component(description);
    			destroy_component(pictures);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pump', slots, []);

    	let imgs = [
    		{
    			"title": "Premium Imported Rice",
    			"address": "../images/rice/rice1.webp"
    		},
    		{
    			"title": "White Rice",
    			"address": "../images/rice/rice2.webp"
    		},
    		{
    			"title": "High-Quality Rice",
    			"address": "../images/rice/rice3.webp"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pump> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Top,
    		Back,
    		Title,
    		Description,
    		Pictures,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('imgs' in $$props) $$invalidate(0, imgs = $$props.imgs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgs];
    }

    class Pump extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pump",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Lift.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/Lift.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let top;
    	let t0;
    	let back;
    	let t1;
    	let title;
    	let t2;
    	let description;
    	let t3;
    	let pictures;
    	let current;
    	top = new Top({ $$inline: true });
    	back = new Back({ $$inline: true });

    	title = new Title({
    			props: { name: "Sugar Importing" },
    			$$inline: true
    		});

    	description = new Description({
    			props: {
    				descript: "Indulge in the sweetness of top-grade sugar sourced from leading international suppliers. Our imported sugar guarantees purity, quality, and versatility, catering to the needs of food manufacturers, bakeries, and households alike. With a reliable supply chain, we bring the finest sugar to your table or business."
    			},
    			$$inline: true
    		});

    	pictures = new Pictures({
    			props: { images: /*imgs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(back.$$.fragment);
    			t1 = space();
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(description.$$.fragment);
    			t3 = space();
    			create_component(pictures.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1lxivbz");
    			add_location(div, file$3, 28, 0, 745);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(top, div, null);
    			append_dev(div, t0);
    			mount_component(back, div, null);
    			append_dev(div, t1);
    			mount_component(title, div, null);
    			append_dev(div, t2);
    			mount_component(description, div, null);
    			append_dev(div, t3);
    			mount_component(pictures, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(back.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(pictures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(back.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(pictures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(top);
    			destroy_component(back);
    			destroy_component(title);
    			destroy_component(description);
    			destroy_component(pictures);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Lift', slots, []);

    	let imgs = [
    		{
    			"title": "Pure Imported Sugar",
    			"address": "../images/sugar/sugar1.webp"
    		},
    		{
    			"title": "Top-Grade Sugar",
    			"address": "../images/sugar/sugar2.webp"
    		},
    		{
    			"title": "Premium Sweet Sugar",
    			"address": "../images/sugar/sugar3.webp"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lift> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Top,
    		Back,
    		Title,
    		Description,
    		Pictures,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('imgs' in $$props) $$invalidate(0, imgs = $$props.imgs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgs];
    }

    class Lift extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lift",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Solar.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/Solar.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let top;
    	let t0;
    	let back;
    	let t1;
    	let title;
    	let t2;
    	let description;
    	let t3;
    	let pictures;
    	let current;
    	top = new Top({ $$inline: true });
    	back = new Back({ $$inline: true });

    	title = new Title({
    			props: { name: "Coffee Exporting" },
    			$$inline: true
    		});

    	description = new Description({
    			props: {
    				descript: "Share the rich flavors of Ethiopian coffee with the world. We export premium-grade coffee beans, celebrated for their unique aroma, bold taste, and exceptional quality. Sourced from the finest Ethiopian farms, our coffee ensures an authentic experience for global coffee enthusiasts and businesses alike."
    			},
    			$$inline: true
    		});

    	pictures = new Pictures({
    			props: { images: /*imgs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(back.$$.fragment);
    			t1 = space();
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(description.$$.fragment);
    			t3 = space();
    			create_component(pictures.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1lxivbz");
    			add_location(div, file$2, 32, 0, 890);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(top, div, null);
    			append_dev(div, t0);
    			mount_component(back, div, null);
    			append_dev(div, t1);
    			mount_component(title, div, null);
    			append_dev(div, t2);
    			mount_component(description, div, null);
    			append_dev(div, t3);
    			mount_component(pictures, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(back.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(pictures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(back.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(pictures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(top);
    			destroy_component(back);
    			destroy_component(title);
    			destroy_component(description);
    			destroy_component(pictures);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Solar', slots, []);

    	let imgs = [
    		{
    			"title": "Authentic Ethiopian Coffee",
    			"address": "../images/coffee/coffee1.webp"
    		},
    		{
    			"title": "Fresh Ethiopian Coffee",
    			"address": "../images/coffee/coffee2.webp"
    		},
    		{
    			"title": "Premium Coffee Beans",
    			"address": "../images/coffee/coffee3.webp"
    		},
    		{
    			"title": "Bold, Flavorful Coffee",
    			"address": "../images/coffee/coffee4.webp"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Solar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Top,
    		Back,
    		Title,
    		Description,
    		Pictures,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('imgs' in $$props) $$invalidate(0, imgs = $$props.imgs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgs];
    }

    class Solar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Solar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Power.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Power.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let top;
    	let t0;
    	let back;
    	let t1;
    	let title;
    	let t2;
    	let description;
    	let t3;
    	let pictures;
    	let current;
    	top = new Top({ $$inline: true });
    	back = new Back({ $$inline: true });

    	title = new Title({
    			props: { name: "Sesame Exporting" },
    			$$inline: true
    		});

    	description = new Description({
    			props: {
    				descript: "Delivering the finest sesame seeds to international markets, we pride ourselves on exporting high-quality, nutrient-rich seeds sourced from Ethiopia's fertile lands. Perfect for oil production, food applications, or health-conscious consumers, our sesame seeds are a testament to purity and excellence."
    			},
    			$$inline: true
    		});

    	pictures = new Pictures({
    			props: { images: /*imgs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(back.$$.fragment);
    			t1 = space();
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(description.$$.fragment);
    			t3 = space();
    			create_component(pictures.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1lxivbz");
    			add_location(div, file$1, 24, 0, 627);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(top, div, null);
    			append_dev(div, t0);
    			mount_component(back, div, null);
    			append_dev(div, t1);
    			mount_component(title, div, null);
    			append_dev(div, t2);
    			mount_component(description, div, null);
    			append_dev(div, t3);
    			mount_component(pictures, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(back.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(pictures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(back.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(pictures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(top);
    			destroy_component(back);
    			destroy_component(title);
    			destroy_component(description);
    			destroy_component(pictures);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Power', slots, []);

    	let imgs = [
    		{
    			"title": "Pure Sesame Seeds",
    			"address": "../images/sesame/sesame1.webp"
    		},
    		{
    			"title": "Premium Sesame",
    			"address": "../images/sesame/sesame2.webp"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Power> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Top,
    		Back,
    		Title,
    		Description,
    		Pictures,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('imgs' in $$props) $$invalidate(0, imgs = $$props.imgs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgs];
    }

    class Power extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Power",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Handling.svelte generated by Svelte v3.59.2 */
    const file = "src/Handling.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let top;
    	let t0;
    	let back;
    	let t1;
    	let title;
    	let t2;
    	let description;
    	let t3;
    	let pictures;
    	let current;
    	top = new Top({ $$inline: true });
    	back = new Back({ $$inline: true });

    	title = new Title({
    			props: { name: "Kidney Beans Exporting" },
    			$$inline: true
    		});

    	description = new Description({
    			props: {
    				descript: "Bringing the best of Ethiopian agriculture to your market, we export high-quality kidney beans known for their rich flavor, nutritional value, and versatility. Whether for wholesalers or food producers, our beans guarantee satisfaction and a reliable supply of premium produce."
    			},
    			$$inline: true
    		});

    	pictures = new Pictures({
    			props: { images: /*imgs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(back.$$.fragment);
    			t1 = space();
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(description.$$.fragment);
    			t3 = space();
    			create_component(pictures.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1lxivbz");
    			add_location(div, file, 28, 0, 758);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(top, div, null);
    			append_dev(div, t0);
    			mount_component(back, div, null);
    			append_dev(div, t1);
    			mount_component(title, div, null);
    			append_dev(div, t2);
    			mount_component(description, div, null);
    			append_dev(div, t3);
    			mount_component(pictures, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(back.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(pictures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(back.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(pictures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(top);
    			destroy_component(back);
    			destroy_component(title);
    			destroy_component(description);
    			destroy_component(pictures);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Handling', slots, []);

    	let imgs = [
    		{
    			"title": "Nutrient-Rich Kidney Beans",
    			"address": "../images/beans/beans1.webp"
    		},
    		{
    			"title": "Quality Kidney Beans",
    			"address": "../images/beans/beans2.webp"
    		},
    		{
    			"title": "Premium Kidney Beans",
    			"address": "../images/beans/beans3.webp"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Handling> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Top,
    		Back,
    		Title,
    		Description,
    		Pictures,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('imgs' in $$props) $$invalidate(0, imgs = $$props.imgs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgs];
    }

    class Handling extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Handling",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				routes: {}, // '/': Home
    				
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Home,
    		Air,
    		Pump,
    		Lift,
    		Solar,
    		Power,
    		Handling
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
