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
    'physicsjs/behaviors/newtonian',
    'physicsjs/integrators/metre-per-second-squared-verlet'

], function( Physics ){
    Physics({
//            integrator: 'metre-per-second-squared-verlet'

        },

        function (world) {
        //inputs
        var ballheight;//@todo utilize
        var friction = 0;
        var metre = 51;

        var viewWidth = document.getElementById('simBox').width
            ,viewHeight = document.getElementById('simBox').height
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

            // metre per second squared verlet integrator
            mppsvi = Physics.integrator('metre-per-second-squared-verlet', {
                metre: metre
            });

        // resize events
        window.addEventListener('resize', function () {

            viewWidth = window.innerWidth-20;
            viewHeight = window.innerHeight-20;

            renderer.el.width = viewWidth;
            renderer.el.height = viewHeight;

            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            // update the boundaries
            edgeBounce.setAABB(viewportBounds);

        }, true);


        // create some bodies
        var b, r, height, width, ramp;
        width = 700;
        height = -500
        r = 2*metre;
        ramp = Physics.body('convex-polygon', {
            name: 'ramp',
            x: 250,
            y: viewHeight,
            treatment: 'static',
            restitution: 0,
            vertices: [
                {x: 0, y: 0},
                {x: 0, y: -viewHeight-100},
                {x: width, y: 0}
            ]
        })

        b = Physics.body('circle', {
            cof: friction,
            radius: r
            ,mass: 5
            ,x: 2*r
            ,y: 120
            ,styles: {
                angleIndicator: '#000',
                fillStyle: '#ffea00'
            }
        });


        // add things to the world
//        world.add(pentagon)
        world.add(ramp);
        world.add( b );
        world.add([
            mppsvi,
            Physics.behavior('body-impulse-response')
            ,edgeBounce
            ,Physics.behavior('constant-acceleration'
                ,{
                acc: { x : 0, y: 9.8 }
            }
            )
            ,Physics.behavior('body-collision-detection')
            ,Physics.behavior('sweep-prune')
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
//            console.log(b.state.vel);
        });
//
//        // start the ticker
        Physics.util.ticker.start();
    });

});

