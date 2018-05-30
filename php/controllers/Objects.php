<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$c = $app['controllers_factory'];

require_once(dirname(__DIR__) .'/models/Objects.php'); 

$model = new Engine\Configurator\Models\Objects($app);
$permModel = new Engine\Models\Permissions($config['roles']);

// $c->before(function ($request, $app) use ($permModel) {
// 	$user = $app['session']->get('user');
// 	$route = $request->get('_route');
	
// 	if(!isset($user["user_group_name"])){
// 		throw new Exception("User is not authorized!");
// 	}

// 	if(!$permModel->isGranted($user["user_group_name"], $route)){
// 		$app['monolog']->addInfo(sprintf(
// 			"User [%s][%s] tried to access the resource [%s]",
// 			$user['username'], $user["user_group_name"], $route
// 		));
// 		throw new Exception("Resource not allowed!");
// 	}
// });

$c->get('/{id}', function ($id) use ($app, $model) {
	
	$object = $model->get($id);

	return $app->json( array("d"=>array("results"=>$object)));
});



$c->delete('/{id}', function ($id) use ($app, $model) {
	
	$model->deleteModule($id);

	return $app->json( array("d"=>array("results"=>array('id'=>$id))));
});

$c->get('/install/{id}', function ($id) use ($app, $model) {
	return $app->json( 
		[
			"d"=>[
				"results"=>$model->installModule($id)
			]
		]
	);
});

$c->get("/", function (Request $req) use ($app, $model) {
	
	$users = $model->getAll($req->query->all());

	return $app->json(array("d"=>array("results"=>$users)));
});



$c->post("/", function (Request $req) use ($app, $model) {
	
	if(isset($_POST["ID"])){
		$id = $model->update($_POST);
	}else{
		$id = $model->create($_POST);
	}

	$object = $model->getUser($id);

	return $app->json( array("d"=>array("results"=>$object)));
});

return $c;