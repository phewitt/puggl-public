import * as gulp from 'gulp';
import * as yargs from 'yargs';
// import * as ts from 'gulp-typescript';
import {isNullOrUndefined} from "util";
import {execSync} from 'child_process';
const argv = yargs.argv;
// const tsProject = ts.createProject('./ssr/tsconfig.json');

gulp.task('build',
  ['checks'],
  (cb) => {
    let commands: string[] = [];
    let quiet: boolean = !isNullOrUndefined(argv.quiet);

    commands.push(`ng build -e ${argv.env} --prod --build-optimizer --app 0`);
    commands.push(`ng build -e ${argv.env} --prod --app 1`);

    commands.push(`rm -rf ssr/browser`);
    commands.push(`rm -rf ssr/server`);
    commands.push(`mkdir ssr/browser`);
    commands.push(`mkdir ssr/server`);
    commands.push(`cp -r dist/* ssr`);

    console.log('');
    if(quiet === true)
      for(let command of commands)
        try { execSync(command) }
        catch (e) {
          console.log('\n\x1b[31m%s\x1b[0m', `ERROR: ${e}`);
          process.exit();
        }
    else
      for(let command of commands) {
        console.log('\x1b[36m%s\x1b[0m', command);
        console.time(command);
        try {
          console.log(execSync(command).toString());
        }
        catch (e) {
          console.timeEnd(command);
          console.log('\n\x1b[31m%s\x1b[0m', `ERROR: ${e}`);
          process.exit();
        }
        console.timeEnd(command);
        console.log('');
      }

    cb();
  }
);

gulp.task('checks', (cb) => {
  if(isNullOrUndefined(argv.env)) {
    console.log('\x1b[33m%s\x1b[0m', 'No env parameter detected, using \'dev\'');
    argv.env = 'dev';
  }
  else cb();
});
