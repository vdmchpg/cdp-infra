import { arrayDouble, kebabString } from 'jsmp-infra-double-kebab';
import $ from 'jquery';
import 'bootstrap';
import '../../bower_components/bootstrap/less/bootstrap.less';
import '../less/all.less';

const btn = $("[data-target='#myModal']");

const makeKebabDouble = () => {
  console.log(arrayDouble([1, 2, 3, 4, 5, 6]), 'to be [2, 4, 6, 8, 10, 12]');
  console.log(kebabString('This will be in kebab case'));
};

btn.on('click', makeKebabDouble);

