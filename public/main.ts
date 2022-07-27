/*
 * @Author: tackchen
 * @Date: 2022-07-24 17:44:42
 * @Description: Coding something
 */
import Main from '../src/index';
const {Logger} = Main;

const win = (window as any);

win.lg = new Logger({id: 'main'});
win.Logger = Logger;
    