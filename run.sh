#!/bin/sh

script_dir=`dirname $0`

if test $# -ne 2; then
    echo "usage: $0 <data-files-dir-path> <yesod-project-path>"
    exit 1
fi

for p in handlebars \
         handlebars-helpers; do
    if test ! -d node_modules/$p; then
        echo "npm install $p"
        npm install $p
    fi
done

if test ! -d hs-yaml2json/.stack-work; then
    cd hs-yaml2json
    echo "stack build"
    stack build
    cd -
fi

data_files_dir=$1
yesod_project_dir=$2
yaml2json=`find hs-yaml2json/.stack-work/install -name hs-yaml2json`
handlebars="node handlebars_process.js"

tmp_dir=tmp
if test -d $tmp_dir; then
    rm -rf $tmp_dir
fi
mkdir $tmp_dir

templates_dir=templates
if test ! -d $templates_dir; then
    mkdir $templates_dir
fi

generateCode() {
    data_filename=$1
    template_filename=$2
    code_file_ext=$3
    echo "  template: $template_filename"
    template_file=$templates_dir/$template_filename
    data_file_json=$tmp_dir/$data_filename.json
    gen_code_file=$tmp_dir/${data_filename}__$template_filename.$code_file_ext

    $yaml2json $data_files_dir/$data_filename > $data_file_json
    $handlebars $template_file $data_file_json > $gen_code_file

    template_file=${template_file}_cmds.hbs
    shell_cmds_file=${gen_code_file}_cmds.sh
    $handlebars $template_file $data_file_json > $shell_cmds_file
    sed -i '' \
        -e "s:__GEN_CODE_FILE__:`pwd`/$gen_code_file:g" \
        -e "s:__YESOD_PROJECT_DIR__:$yesod_project_dir:g" \
        $shell_cmds_file
}

checkError() {
    if test $? -ne 0; then
        exit 1
    fi
}

for data_file in $data_files_dir/*; do
    echo "generate code: $data_file ..."
    data_filename=`basename $data_file`
    if echo "$data_file" | grep -q "/modelWithView_"; then
        echo "  modelWithView"
        generateCode $data_filename model_handler.hbs hs
        checkError
        generateCode $data_filename model_edit_form_hamlet.hbs html
        checkError
        generateCode $data_filename model_edit_form_fields_hamlet.hbs html
        checkError
        generateCode $data_filename model_add_form_hamlet.hbs html
        checkError
        generateCode $data_filename model_add_form_fields_hamlet.hbs html
        checkError
        generateCode $data_filename model_config.hbs txt
        checkError
        generateCode $data_filename model_list_hamlet.hbs html
        checkError
    fi
done

# remove not needed files that may be replaced

rm $yesod_project_dir/templates/*_gen.hamlet

# for f in ; do
#     if test -f $f; then
#         echo "delete file: $f"
#         rm $f
#     fi
# done

for cmd_file in $tmp_dir/*.sh; do
    echo "update project: $cmd_file ..."
    sh $cmd_file
done
