require.config({
    baseUrl: './scripts',
    // ...
    packages: [
        {
            name: 'physicsjs',
            location: 'physicsjs',
            main: 'physicsjs-0.6.0.min'
        }
    ]
});

require([
    'physicsjs',
    'physicsjs/bodies/circle', // will mix into the PhysicsJS library
    'physicsjs/renderers/canvas',
    'physicsjs/behaviors/attractor',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/constant-acceleration',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-impulse-response',
    'physicsjs/bodies/convex-polygon',
    'physicsjs/behaviors/newtonian'

], function( Physics ){
    Physics(function (world) {
    //    console.log(Physics);
        var viewWidth = window.innerWidth
            ,viewHeight = window.innerHeight
        // center of the window
            ,center = Physics.vector(viewWidth, viewHeight).mult(0.5)
        // bounds of the window
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,edgeBounce
            ,renderer;

        // create a renderer
        renderer = Physics.renderer('canvas', {
            el: 'simBox'
            ,width: viewWidth
            ,height: viewHeight
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });

        // constrain objects to these bounds
        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds
            ,restitution: 0.2
            ,cof: 0.8
        });

        // resize events
        window.addEventListener('resize', function () {

            viewWidth = window.innerWidth;
            viewHeight = window.innerHeight;

            renderer.el.width = viewWidth;
            renderer.el.height = viewHeight;

            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            // update the boundaries
            edgeBounce.setAABB(viewportBounds);

        }, true);

//        // move the attractor position to match the mouse coords
//        renderer.el.addEventListener('mousemove', function( e ){
//            attractor.position({ x: e.pageX, y: e.pageY });
//        });

        // create some bodies
        var b, r;

        r = (20 + Math.random()*30)|0;
        b = Physics.body('circle', {
            radius: r
            ,mass: r
            ,x: Math.random()*viewWidth
            ,y: 0
//            ,vx:1
//          ,vx: v.y
            ,styles: {
                fillStyle:'#cb4b16'


            }
        });

//        var pentagon = Physics.body('convex-polygon', {
//            treatment: 'static',
//            // place the centroid of the polygon at (300, 200)
//            x: 300,
//            y: 200,
//
//            // the centroid is automatically calculated and used to position the shape
//            vertices: [
//                { x: 0, y: -30 },
//                { x: -29, y: -9 },
//                { x: -18, y: 24 },
//                { x: 18, y: 24 },
//                { x: 29, y: -9 }
//            ]
//        });

        // add things to the world
//        world.add(pentagon)
        world.add( b );
        world.add([
            Physics.behavior('body-impulse-response')
            ,edgeBounce
            ,Physics.behavior('constant-acceleration')
            ,Physics.behavior('body-collision-detection')
            ,Physics.behavior('sweep-prune')
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });

        // start the ticker
        Physics.util.ticker.start();
    });

});

