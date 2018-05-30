<?php

namespace Engine\Configurator\Models;

use Engine\Library\Model;

class Objects extends Model {

	public function getAll($id){
		$rows = [];

		foreach ($this->registry['config.modules'] as $id => $module) {
			array_push($rows, [
				'ID' => $id,
				'Name' => !empty($module['name']) ? $module['name'] : $id
			]);
		}

		return $rows;
	}

	public function get($id){
		$module = $this->registry['config.modules'][$id];
		
		$row = [
			'ID' => $id,
			'Name' => !empty($module['name']) ? $module['name'] : $id
		];

		return [$row];
	}

	public function installModule($id){
		$module = $this->registry['config.modules'][$id];

		require_once($module["installer"]["path"]);
		$class = $module["installer"]["class"];

		$installer = new $class($this->registry);

		return $installer->install();
	}

	public function deleteModule($id){
		$module = $this->registry['config.modules'][$id];

		require_once($module["installer"]["path"]);
		$class = $module["installer"]["class"];

		$installer = new $class($this->registry);

		return $installer->delete();
	}	

	// public function update($data) {
	// 	$row = [
	// 		"ID" => 1,
	// 		"Name" => $data["Name"]
	// 	];

	// 	return [$row];
	// }

	// public function create($data) {
	// 	$row = [
	// 		"ID" => 1,
	// 		"Name" => $data["Name"]
	// 	];

	// 	return [$row];
	// }

	// public function delete($ID) {
	// 	$row = [
	// 		"ID" => $ID
	// 	];

	// 	return [$row];
	// }
}
