var plugin_data = {
	id: 'entity_file_generator',
	title: 'Entity File Generator',
	icon: 'library_books',
	author: 'JannisX11 and BSavage81',
	description: 'Generate File Structure for Bedrock Entities',
	version: '1.2.1',
	variant: 'desktop'
}
MenuBar.addAction(new Action(
{
	id: 'gen_entity_files',
	name: 'Generate Entity Files',
	icon: 'library_books',
	category: 'filter',
	click: function(ev)
	{
		var lines = [
		{
			label: 'Author',
			node: '<input class="dark_bordered half" type="text" id="EFG_author" placeholder="Author" inline="true">'
		},
		{
			label: 'Description',
			node: '<input class="dark_bordered half" type="text" id="EFG_desc" placeholder="Description" inline="true">'
		},
		{
			label: 'Pack Version #',
			node: '<input class="dark_bordered half" type="text" id="EFG_version" value="1, 0, 0">'
		},
		{
			label: 'Min Engine Version #',
			node: '<input class="dark_bordered half" type="text" id="EFG_mev" value="1, 8, 0">'
		},
		{
			label: 'Game ID',
			node: '<input class="dark_bordered half" type="text" id="EFG_id" placeholder="space:firefly">'
		},
		{
			label: 'Filename',
			node: '<input class="dark_bordered half" type="text" id="EFG_filename" placeholder="firefly">'
		},
		{
			label: 'Spawn Egg Main',
			node: '<input type="color" id="EFG_color_main">'
		},
		{
			label: 'Spawn Egg Accent',
			node: '<input type="color" id="EFG_color_accent">'
        	},
		{
			label: 'Pack Icon',
			node: '<input type="file" id="EFG_packicon" accept="image/png">'
		},
		{
			label: '---Optional Items---',
		},
		{
			label: 'Animation',
			node: '<input class="dark_bordered half" type="text" id="EFG_animation" placeholder="flap">'
		},
		{
			label: 'Anim. Controller',
			node: '<input class="dark_bordered half" type="text" id="EFG_actrl" placeholder="move">'
		},
		{
			label: 'Alpha Texture',
			node: '<input type="checkbox" id="EFG_alpha">'
		},
		{
			label: 'New Entity Model?',
			node: '<input type="checkbox" id="EFG_model">'
		},
		{
			label: 'Loot Table?',
			node: '<input type="checkbox" id="EFG_loot">'
		},
		{
			label: 'Spawn Rules?',
			node: '<input type="checkbox" id="EFG_spawnrules">'
		}, 
		]

		var dialog = new Dialog(
		{
			id: 'EFG_gen',
			title: 'Entity Files Generator',
			draggable: true,
			lines: lines,
			onConfirm: function()
			{
				var options = {
					author: $('.dialog#EFG_gen input#EFG_author').val(),
					desc: $('.dialog#EFG_gen input#EFG_desc').val(),
					version: $('.dialog#EFG_gen input#EFG_version').val(),
					mev: $('.dialog#EFG_gen input#EFG_mev').val(),
					id: $('.dialog#EFG_gen input#EFG_id').val(),
					filename: $('.dialog#EFG_gen input#EFG_filename').val(),
					color1: $('.dialog#EFG_gen input#EFG_color_main').val(),
					color2: $('.dialog#EFG_gen input#EFG_color_accent').val(),
					model: $('.dialog#EFG_gen input#EFG_model').is(':checked'),
					animation: $('.dialog#EFG_gen input#EFG_animation').val(),
                    			actrl: $('.dialog#EFG_gen input#EFG_actrl').val(),
                   			packicon: $('.dialog#EFG_gen input#EFG_packicon').val(),
					alpha: $('.dialog#EFG_gen input#EFG_alpha').is(':checked'),
					loot: $('.dialog#EFG_gen input#EFG_loot').is(':checked'),
					spawnrules: $('.dialog#EFG_gen input#EFG_spawnrules').is(':checked'),
					uuidrp1: guid(),
					uuidrp2: guid(),
					uuidbp1: guid(),
					uuidbp2: guid(),
				}
				dialog.hide()
				electron.dialog.showOpenDialog(currentwindow,
				{
					title: 'Select Resource Pack',
					properties: ['openDirectory'],
				}, function(filePaths)
				{
					if (filePaths)
					{
						options.bf = filePaths[0]
						EntityFileGen.generate(options)
					}
				})
			}
		})
		dialog.show()
	}
}), 'filter')

window.EntityFileGen = {
	generate: function(options)
	{
		function onError(err)
		{
			if (err)
			{
				console.log('File Writing Error: ', err)
			}
		}

		function prep__Folder(path)
		{
			try
			{
				fs.mkdirSync(path)
			}
			catch (err)
			{}
		}
		var S = osfs;


//RP Manifest
prep__Folder(options.bf + S + options.filename + ' rp')
fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'manifest.json',
`{
	"format_version":1,
	"header":{
		"name":"${capitalizeFirstLetter(options.filename)} Resources",
		"description":"${options.desc}",
		"uuid":"${options.uuidrp1}",		
		"version":[${options.version}],
		"min_engine_version":[${options.mev}]
	},
	"modules":[
		{
			"type":"resources",
			"uuid":"${options.uuidrp2}",
			"version":[${options.version}]
		}
	],
	"metadata":{
		"authors":[
			"${options.author}"
		]
	}
}
`, onError)

//RP Packicon

prep__Folder(options.bf + S + options.filename + ' rp')
fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'pack_icon.png', {savetype: 'image', content: options.packicon})

//Entity Definition
prep__Folder(options.bf + S + options.filename + ' rp' + S + 'entity')
blockbench.writeFile(options.bf + S + options.filename + ' rp' + S + 'entity' + S + options.filename + '.json',
`{
	"format_version": "1.8.0",
		"minecraft:client_entity": {
			"description": {
				"identifier": "${options.id}",
				"spawn_egg": {
					"base_color": "${options.color1}",
					"overlay_color": "${options.color2}"
			},
			"render_controllers": [
				"controller.render.${options.filename}"
			],
			"geometry": {
				"default": "geometry.${options.filename}"
			},
			"textures": {
				"default": "textures/entity/${options.filename}"
			},
			"materials": {
				"default": "${options.alpha ? 'entity_alphatest' : 'entity'}"
			}${ (options.animation && options.actrl) ? `,
			"animations": {
				"${options.animation}": "animation.${options.filename}.${options.animation}"
			},
			"animation_controllers": [
				{
					"${options.actrl}": "controller.animation.${options.filename}.${options.actrl}"
				}
			]` : ''}
		}
	}
}	
`, onError)

//Render Controller
prep__Folder(options.bf + S + options.filename + ' rp' + S + 'render_controllers')
fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'render_controllers' + S + options.filename + '.json',
`{
	"format_version": "1.10.0",
	"render_controllers": {
		"controller.render.${options.filename}": {
			"geometry": "Geometry.default",
			"materials": [{"*": "Material.default"}],
			"textures": ["Texture.default"]
		}
	}
}
`, onError)

//texture
prep__Folder(options.bf + S + options.filename + ' rp' + S + 'textures')
prep__Folder(options.bf + S + options.filename + ' rp' + S + 'textures' + S + 'entity')

//model
if (options.model)
	{
		prep__Folder(options.bf + S + options.filename + ' rp' + S + 'models')
		prep__Folder(options.bf + S + options.filename + ' rp' + S + 'models' + S + 'entity')
		fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'models' + S + 'entity' + S + options.filename + '.json',
`{
	"format_version": "1.10.0",
	"geometry.${options.filename}": {
		"texturewidth": 16,
		"textureheight": 16,
		"visible_bounds_width": 0,
		"visible_bounds_height": 0,
		"visible_bounds_offset": [0, 0, 0],
	"bones": [
		{
			"name": "bone",
			"pivot": [0, 0, 0]
		}
	]}
}
`, onError)
	}

//texts
prep__Folder(options.bf + S + options.filename + ' rp' + S + 'texts')
fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'texts' + S + 'en_US.lang',
`## Comments can be added anywhere on a valid line by starting with '##'
##
## Note, trailing spaces will NOT be trimmed. If you want room between the end of the string and the start of a
## comment on the same line, use TABs.
entity.${options.id}.name= ${capitalizeFirstLetter(options.filename)}
item.spawn_egg.entity.${options.id}.name=Spawn ${capitalizeFirstLetter(options.filename)}
`, onError)

//Animation
if (options.animation)
	{
		prep__Folder(options.bf + S + options.filename + ' rp' + S + 'animations')
		fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'animations' + S + options.filename + '.json',
`{
	"format_version": "1.10.0",
	"animations": {
		"animation.${options.filename}.${options.animation}": {
		}
	}
}
`, onError)
	}

//AnimationController
if (options.actrl && options.animation)
	{
		prep__Folder(options.bf + S + options.filename + ' rp' + S + 'animation_controllers')
		fs.writeFile(options.bf + S + options.filename + ' rp' + S + 'animation_controllers' + S + options.filename + '.json',
`{
	"format_version": "1.10.0",
	"animation_controllers": {
    	"controller.animation.${options.filename}.${options.actrl}": {
			"states": {
				"default": {
					"animations": ["${options.animation}"]
				}
			}
		}
	}
}
`, onError)
	}

//BP Manifest
prep__Folder(options.bf + S + options.filename + ' bp')
fs.writeFile(options.bf + S + options.filename + ' bp' + S + 'manifest.json',
`{
    "format_version": 1,
    "header": {
        "name": "${capitalizeFirstLetter(options.filename)} Behaviors",
        "description": "${options.desc}",
        "uuid": "${options.uuidbp1}",
        "version": [${options.version}]
        },
    "modules": [
        {
        "type": "data",
        "uuid": "${options.uuidbp2}",
        "version": [${options.version}]
        }
    ],
    "dependencies": [
    	{
		"uuid": "${options.uuidrp1}",
		"version": [${options.version}]
    	}
    ],
    "metadata": {
        "authors": [
            "${options.author}"
        ]
    }
}
`, onError)

//Behavior Entity file
prep__Folder(options.bf + S + options.filename + ' bp')
prep__Folder(options.bf + S + options.filename + ' bp' + S + 'entities')
fs.writeFile(options.bf + S + options.filename + ' bp' + S + 'entities' + S + options.filename + '.json',
`{
	"format_version": "1.10.0",
	"minecraft:entity": {
		"description": {
			"identifier": "${options.id}",
			"is_spawnable": true,
			"is_summonable": true,
			"is_experimental": false
		},
		"components": {
			"minecraft:physics": {},
			"minecraft:scale": {
				"value": 1.0
			}
		}
	}
}
`, onError)

//Loot
if (options.loot)
	{
    	prep__Folder(options.bf + S + options.filename + ' bp' + S + 'loot_tables')
		prep__Folder(options.bf + S + options.filename + ' bp' + S + 'loot_tables' + S + 'entities')
		fs.writeFile(options.bf + S + options.filename + ' bp' + S + 'loot_tables' + S + 'entities' + S + options.filename + '.json',
`{
	"pools": [
	],
}
`, onError)
	}

//Spawn Rules
if (options.spawnrules)
	{
    	prep__Folder(options.bf + S + options.filename + ' bp' + S + 'spawn_rules')
        fs.writeFile(options.bf + S + options.filename + ' bp' + S + 'spawn_rules' + S + options.filename + '.json',
`{
	"format_version": "1.8.0",
	"minecraft:spawn_rules": {
		"description": {
			"identifier": "${options.id}",
			"population_control": "animal"
		},
		"conditions": [
			{
				"minecraft:spawns_on_surface": {},
				"minecraft:spawns_on_block_filter": "minecraft:grass",
				"minecraft:brightness_filter": {
					"min": 7,
					"max": 15,
					"adjust_for_weather": false
				},
				"minecraft:weight": {
					"default": 10
				},
				"minecraft:herd": {
					"min_size":2,
					"max_size":4
				},
      
				"minecraft:biome_filter": {
					"test": "has_biome_tag", "operator":"==", "value": "animal"
				}
			}
		]
	}
}
`, onError)
		}
		Blockbench.showQuickMessage('Generating successful!')
	}
}
onUninstall = function()
{
	MenuBar.removeAction('filter.gen_entity_files')
}
