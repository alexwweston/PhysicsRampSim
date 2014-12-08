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
            getBallHeight: function getBallHeight(){
                return 10;
            },
            getFriction: function getFriction (){
                return 1;
            }
        },
        function (world) {
        //inputs
        console.log(world);
        var ballheight = world.options.getBallHeight();//@todo utilize
        var friction = world.options.getFriction();
        var metre = 30;

        var viewWidth = document.getElementById('simBox').width
            ,viewHeight = document.getElementById('simBox').height
        // bounds of the window
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,renderer;

        world.getSimHeight = function (objHeight){
            return (viewHeight-objHeight)/metre;
        }
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
            ,restitution:0
            ,cof: 0.8
        });

        // metre per second squared verlet integrator
        mppsvi = Physics.integrator('metre-per-second-squared-verlet', {
            metre: metre
        });


        // create some bodies
        var b,
        r = metre,
        height = viewHeight -2*r,
        width = viewWidth -4*r,
        ramp;

        ramp = Physics.body('convex-polygon', {
            name: 'ramp',
            x: (width/3),
            y: (2*height/3)+2*r,
            treatment: 'static',
            restitution: 0,
            vertices: [
                {x: 0, y: 0},
                {x: 0, y: -height},
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
            })
            ,Physics.behavior('body-collision-detection')
            ,Physics.behavior('sweep-prune')
        ]);
        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
            var sigfig = 10000;
            var metrePerSecond = 30 / 1000;

            document.getElementById('velocity').innerHTML = Math.round((b.state.vel.norm()/ metrePerSecond)*sigfig)/sigfig;///sigfig + ", " + Math.round(b.state.vel.y*sigfig)/sigfig;

            if(b.state.pos && b.state.pos.y && world.getSimHeight(b.state.pos.y) < 1.1 ){
                if(!world.isPaused()){
                    world.pause();
                }
            }
            else{
                console.log(world.getSimHeight(b.state.pos.y));
            }
        });
        // start the ticker
        Physics.util.ticker.start();
    });

});

