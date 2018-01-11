const gulp = require('gulp');

gulp.task('copyImage', () => {
    gulp.src(['src/images/*.png', 'src/images/*.jpg', 'src/images/*.jpeg'])
        .pipe(gulp.dest('./public/images'));
    gulp.src(['src/images/avatarList/*.png', 'src/images/avatarList/*.jpg', 'src/images/avatarList/*.jpeg'])
        .pipe(gulp.dest('./public/images/avatarList'));
});

